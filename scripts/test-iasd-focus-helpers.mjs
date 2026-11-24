import assert from 'node:assert/strict';

export async function collectIasdFocusDiagnostic(control) {
  return control.evaluate(el => {
    const style = getComputedStyle(el);
    const pane = el.closest('.pane');
    const rect = el.getBoundingClientRect();
    return {
      setting: el.dataset.setting,
      connected: el.isConnected,
      focused: document.activeElement === el,
      active: document.activeElement?.id || document.activeElement?.tagName,
      focusVisible: el.matches(':focus-visible'),
      outline: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      height: rect.height,
      layoutHeight: el.offsetHeight,
      rect: rect.toJSON(),
      paneTransform: pane ? getComputedStyle(pane).transform : null,
      animations: pane?.getAnimations().map(animation => ({ state: animation.playState, time: animation.currentTime, name: animation.animationName })) || [],
    };
  });
}

export async function assertIasdKeyboardTarget(page, control, label) {
  // A translated pane can round a 44px DOMRect down during appear; measure its final geometry.
  await control.evaluate(el => Promise.all(el.closest('.pane').getAnimations().map(animation => animation.finished)));
  await control.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const actual = await collectIasdFocusDiagnostic(control);
  assert.equal(actual.focused, true, `${label}: keyboard return ${JSON.stringify(actual)}`);
  assert.notEqual(actual.outline, 'none', `${label}: focus outline ${JSON.stringify(actual)}`);
  assert.ok(Number.parseFloat(actual.outlineWidth) > 0, `${label}: visible outline ${JSON.stringify(actual)}`);
  assert.ok(actual.height >= 44, `${label}: 44px tap target ${JSON.stringify(actual)}`);
  return actual;
}
