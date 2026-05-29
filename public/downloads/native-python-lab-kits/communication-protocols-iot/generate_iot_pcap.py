#!/usr/bin/env python3
import struct, time, socket

def checksum(data):
    if len(data)%2: data += b'\x00'
    s=sum(struct.unpack('!%dH'%(len(data)//2), data)); s=(s>>16)+(s&0xffff); s += s>>16
    return (~s)&0xffff

def ip_packet(src,dst,proto,payload):
    ver_ihl=0x45; total=20+len(payload); ident=1; flags_frag=0; ttl=64
    hdr=struct.pack('!BBHHHBBH4s4s',ver_ihl,0,total,ident,flags_frag,ttl,proto,0,socket.inet_aton(src),socket.inet_aton(dst))
    c=checksum(hdr); hdr=struct.pack('!BBHHHBBH4s4s',ver_ihl,0,total,ident,flags_frag,ttl,proto,c,socket.inet_aton(src),socket.inet_aton(dst))
    return hdr+payload

def tcp_segment(src_port,dst_port,payload,seq=1,flags=0x18):
    offset=5<<4; window=8192
    return struct.pack('!HHIIBBHHH',src_port,dst_port,seq,0,offset,flags,window,0,0)+payload

def udp_segment(src_port,dst_port,payload):
    return struct.pack('!HHHH',src_port,dst_port,8+len(payload),0)+payload

def frame(ip_payload):
    return b'\xaa\xbb\xcc\xdd\xee\ff' + b'\x11\x22\x33\x44\x55\x66' + b'\x08\x00' + ip_payload

def rec(pkt):
    ts=int(time.time()); usec=0
    return struct.pack('<IIII',ts,usec,len(pkt),len(pkt))+pkt

packets=[]
packets.append(frame(ip_packet('10.10.1.20','8.8.8.8',17,udp_segment(54000,53,b'DNS query broker.farm-cloud.local'))))
packets.append(frame(ip_packet('10.10.1.20','10.10.1.10',6,tcp_segment(42000,1883,b'MQTT CONNECT client=farm-gateway-01'))))
packets.append(frame(ip_packet('10.10.1.20','10.10.1.10',6,tcp_segment(42000,1883,b'MQTT PUBLISH topic=farm/soil/moisture qos=0 value=27'))))
packets.append(frame(ip_packet('10.10.1.20','10.10.1.10',6,tcp_segment(42000,1883,b'MQTT PUBLISH topic=farm/alert/critical qos=1 value=dry-soil'))))
packets.append(frame(ip_packet('10.10.1.20','10.10.1.10',17,udp_segment(53000,9000,b'UDP telemetry value=26 no_ack'))))
header=struct.pack('<IHHIIII',0xa1b2c3d4,2,4,0,0,65535,1)
with open('iot_protocol_lab.pcap','wb') as f:
    f.write(header); [f.write(rec(p)) for p in packets]
print('Wrote iot_protocol_lab.pcap with DNS, TCP:1883 MQTT-style payloads, and UDP telemetry evidence')
