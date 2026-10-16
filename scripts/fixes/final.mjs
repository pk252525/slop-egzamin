// ITNv7 Final Exam: corrections and additions from verification (see README).
const IMG = 'Pary przepisane z obrazka na stronie źródłowej (w HTML nie było tekstu).';

export default ({ fix, drop, columns }) => {
  // identical to #96
  drop(120);

  fix(12, (q) => {
    q.distractors = ['subnet mask'];
    q.explanation = 'An IPv6 global unicast address consists of a global routing prefix (the network portion assigned by the provider), a subnet ID (used by the organization to identify subnets) and an interface ID (the equivalent of the host portion of an IPv4 address). IPv6 does not use a subnet mask.';
  });
  fix(14, (q) => {
    q.pairs = [...columns(q.raw.rows).map((p) => ({ ...p, right: p.right.toLowerCase() })), { left: 'does not forward broadcasts', right: null }];
  });
  fix(17, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'Network A', right: '192.168.0.128 /25' },
      { left: 'Network B', right: '192.168.0.0 /26' },
      { left: 'Network C', right: '192.168.0.96 /27' },
      { left: 'Network D', right: '192.168.0.80 /30' },
    ];
    q.images = q.images.slice(0, 1); // the topology; the second image is the solution
    q.note = IMG;
  });
  fix(20, (q) => {
    q.question = q.question.split('\n')[0]; // followed by the question repeated in parentheses
  });
  fix(28, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'Network A', right: '192.168.0.0 /25' },
      { left: 'Network B', right: '192.168.0.128 /26' },
      { left: 'Network C', right: '192.168.0.192 /27' },
      { left: 'Network D', right: '192.168.0.224 /30' },
    ];
    q.distractors = ['192.168.0.0 /24', '192.168.0.228 /32'];
    q.images = q.images.slice(0, 1);
    q.note = IMG;
  });
  fix(30, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'FTP', right: 'TCP' },
      { left: 'HTTP', right: 'TCP' },
      { left: 'SMTP', right: 'TCP' },
      { left: 'DHCP', right: 'UDP' },
      { left: 'TFTP', right: 'UDP' },
    ];
    delete q.images;
    q.explanation = 'FTP, HTTP and SMTP need reliable delivery and use TCP. DHCP and TFTP use UDP.';
    q.note = IMG;
  });
  fix(33, (q) => {
    const opt = (dst2, dst3, src3) =>
      `Layer 2 destination address = ${dst2}\nLayer 2 source address = 00-00-0c-94-36-bb\nLayer 3 destination address = ${dst3}\nLayer 3 source address = ${src3}`;
    q.question = q.question.replace(/\n[\s\S]*$/, '');
    q.type = 'choice';
    q.options = [
      opt('00-00-0c-94-36-ab', '172.16.20.200', '172.16.10.200'),
      opt('00-00-0c-94-36-dd', '172.16.20.200', '172.16.10.200'),
      opt('00-00-0c-94-36-cd', '172.16.20.99', '172.16.10.200'),
      opt('00-00-0c-94-36-ab', '172.16.20.200', '172.16.100.200'),
    ];
    q.correct = [0];
    q.explanation = 'Host D is on another subnet, so host B sends the frame to its default gateway: the Layer 2 destination is the MAC address of the router interface Fa0 (00-00-0c-94-36-ab). The Layer 3 addresses stay end to end: source 172.16.10.200 (host B) and destination 172.16.20.200 (host D).';
    q.note = 'Poprawiono wyjaśnienie – w źródle dotyczyło numerów portów, a nie adresów L2/L3.';
  });
  fix(43, (q) => {
    q.explanation = q.explanation.replace('19.168.100.1', '192.168.100.1');
  });
  fix(57, (q) => {
    q.explanation = 'transport input ssh allows only SSH connections on the vty lines, so all communication between the switch and remote users is encrypted. Telnet connections are refused.';
  });
  fix(58, (q) => {
    q.explanation = 'Electrical threats affect the power supply, hardware threats are physical damage to devices and cabling, environmental threats are temperature and humidity extremes, and maintenance threats come from poor handling, missing spare parts, poor cabling and labeling.';
  });
  fix(96, (q) => {
    q.question = q.question.split('\n')[0]; // followed by the answers
    q.type = 'match';
    q.pairs = [
      { left: 'no dedicated server is required', right: 'peer-to-peer network' },
      { left: 'client and server roles are set on a per request basis', right: 'peer-to-peer network' },
      { left: 'requires a specific user interface', right: 'peer-to-peer application' },
      { left: 'a background service is required', right: 'peer-to-peer application' },
      { left: 'devices can only function in one role at a time', right: null },
    ];
    delete q.images;
    q.note = IMG;
  });
  fix(99, (q) => {
    q.distractors = ['This field identifies special flow control services.'];
    q.explanation = 'The frame start field identifies the beginning of the frame, the addressing fields direct it to its destination, the type field tells the LLC which Layer 3 protocol is carried, and the error detection (FCS) field checks whether the frame was damaged.';
  });
  fix(101, (q) => {
    q.distractors = ['network address translator'];
  });
  fix(110, (q) => {
    q.pairs = [...columns(q.raw.rows), { left: '64 bits', right: null }];
    q.explanation = 'An IP address is a Layer 3 address of 32 (IPv4) or 128 (IPv6) bits made of a network portion and a host identifier. A MAC address is a 48-bit Layer 2 address made of the OUI and a vendor-assigned identifier.';
  });
  fix(122, (q) => {
    q.question = 'Which connector is used with twisted-pair cabling in an Ethernet LAN?';
    q.type = 'choice';
    q.options = ['LC connector', 'SC connector', 'BNC', 'RJ-11', 'RJ-45'];
    q.correct = [4];
    delete q.images;
    q.explanation = 'Ethernet twisted-pair (UTP/STP) cabling is terminated with RJ-45 connectors. LC and SC are fiber-optic connectors, BNC is used with coaxial cable, and RJ-11 is a telephone connector.';
  });
  fix(126, (q) => {
    q.pairs = [...columns(q.raw.rows), { left: 'Destination Options', right: null }];
    q.explanation = 'Layer 2 (data link): 802.2 header, destination MAC address and FCS. Layer 3 (network): source IP address and TTL. Layer 4 (transport): destination port number and acknowledgment number. Destination Options is an IPv6 extension header and is not used.';
  });
  fix(145, (q) => {
    q.explanation = 'Encapsulation places one message format inside another, sizing breaks a long message into smaller pieces, and encoding converts information into a form acceptable for transmission.';
  });
  fix(149, (q) => {
    q.distractors = ['FCS'];
    q.explanation = 'The window size is the number of bytes the destination can accept and process at one time. Sequence numbers identify missing segments, retransmission handles lost data, and the sender must receive an acknowledgment before transmitting more segments.';
  });
  fix(152, (q) => {
    q.pairs = [...columns(q.raw.rows), { left: 'USB port on a desktop PC in a classroom', right: null }];
  });
  fix(157, (q) => {
    q.explanation = '240.0.0.0–255.255.255.254 are experimental addresses, 169.254.0.0/16 is link-local, 127.0.0.0/8 is loopback, and 198.133.219.2 is a public address.';
  });
};
