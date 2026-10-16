// Modules 14–15: corrections and additions from verification (see README).
const PORTS = 'Well-known destination ports: FTP 21 (control), SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67 (server), TFTP 69, HTTP 80, POP3 110, SNMP 161, HTTPS 443.';

export default ({ fix }) => {
  fix(1, (q) => {
    q.explanation = 'UDP is connectionless: there is no handshake, window or ISN. The client simply picks a random (dynamic) source port number and sends the datagram to the well-known destination port of the service.';
  });
  fix(2, (q) => {
    q.explanation = 'TCP is connection-oriented and uses the three-way handshake (SYN, SYN-ACK, ACK) to establish a session before data is sent. UDP has no ACK flag and no sequence numbers.';
  });
  fix(3, (q) => {
    q.explanation = 'Well-known ports are 0–1023, registered ports 1024–49151, and dynamic or private ports 49152–65535.';
  });
  fix(4, (q) => {
    q.explanation = 'A socket is the combination of an IP address and a port number, for example 192.168.1.5:80. A pair of sockets (source and destination) identifies one conversation.';
  });
  fix(13, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'client sends FIN', right: 'step 1' },
      { left: 'server sends ACK', right: 'step 2' },
      { left: 'server sends FIN', right: 'step 3' },
      { left: 'client sends ACK', right: 'step 4' },
      { left: 'client sends SYN', right: null },
      { left: 'server sends SYN', right: null },
    ];
    delete q.images;
    q.note = 'Pary przepisane z obrazka na stronie źródłowej. Drugi obrazek w źródle ma błędną kolejność (SYN zamiast FIN) – użyto poprawnej sekwencji zgodnej z wyjaśnieniem.';
  });
  fix(50, (q) => {
    q.explanation = 'Two packets carry bytes 1–3000. The acknowledgment number is the next byte the receiver expects, so the server acknowledges with 3001.';
  });
  fix(51, (q) => {
    q.explanation = 'Three packets carry bytes 1–4500. The acknowledgment number is the next byte the receiver expects, so the server acknowledges with 4501.';
  });
  fix(52, (q) => {
    q.explanation = 'Four packets carry bytes 1–6000, which fills the 6,000-byte window. The acknowledgment number is the next byte the receiver expects, so the server acknowledges with 6001.';
  });
  for (let id = 53; id <= 61; id++) fix(id, (q) => (q.explanation = PORTS));
};
