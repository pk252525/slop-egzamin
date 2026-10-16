// Modules 11–13: corrections and additions from verification (see README).
const IMG = 'Pary przepisane z obrazka na stronie źródłowej (w HTML nie było tekstu).';
const COMPRESS = 'Leading zeros in each hextet are omitted, and one longest run of all-zero hextets is replaced by a double colon (::), which can be used only once in an address.';

export default ({ fix }) => {
  fix(2, (q) => {
    q.explanation = 'A /26 mask leaves 6 host bits: 2^6 = 64 addresses, minus the network and broadcast addresses = 62 usable host addresses.';
  });
  fix(3, (q) => {
    q.explanation = '5 host bits leave 27 network bits: /27 = 255.255.255.224 (11100000 in the last octet).';
  });
  fix(4, (q) => {
    q.explanation = 'Going from /24 to /26 borrows 2 bits, which creates 2^2 = 4 equal-sized subnets of 64 addresses each.';
  });
  fix(5, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: '192.168.1.32/27', right: '192.168.1.48' },
      { left: '192.168.1.64/27', right: '192.168.1.68' },
      { left: '192.168.1.96/27', right: '192.168.1.121' },
    ];
    q.distractors = ['192.168.1.63', '192.168.1.128'];
    delete q.images;
    q.note = IMG;
  });
  fix(10, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: '192.168.100.161/25', right: 'host address' },
      { left: '203.0.113.100/24', right: 'host address' },
      { left: '10.10.10.128/25', right: 'network address' },
      { left: '172.110.12.64/28', right: 'network address' },
      { left: '192.168.1.191/26', right: 'broadcast address' },
      { left: '10.0.0.159/27', right: 'broadcast address' },
      { left: '224.10.0.254/24', right: null },
    ];
    delete q.images;
    q.explanation = '192.168.100.161/25 and 203.0.113.100/24 are host addresses. 10.10.10.128/25 and 172.110.12.64/28 have all host bits set to 0, so they are network addresses. 192.168.1.191/26 and 10.0.0.159/27 have all host bits set to 1, so they are broadcast addresses. 224.10.0.254 is a multicast address and does not belong to any of the categories.';
    q.note = IMG;
  });
  fix(17, (q) => {
    q.images = q.raw.images.slice(0, 1); // the topology; the second image is the solution
  });
  fix(26, (q) => {
    q.question = 'Consider the following range of addresses:';
    q.exhibit = '2001:0DB8:BC15:00A0:0000::\n2001:0DB8:BC15:00A1:0000::\n2001:0DB8:BC15:00A2:0000::\n…\n2001:0DB8:BC15:00AF:0000::';
    q.question2 = 'What is the prefix-length for the range of addresses?';
    q.type = 'choice';
    q.options = ['/48', '/56', '/60', '/64'];
    q.correct = [2];
    q.note = 'W oryginale pytanie z luką do uzupełnienia – zamienione na pytanie z wyborem.';
  });
  fix(28, (q) => {
    q.question = q.question.replace(/\n[\s\S]*$/, '');
  });
  fix(38, (q) => {
    q.distractors = ['DHCP'];
  });
  fix(39, (q) => {
    q.explanation = '127.0.0.1 is the loopback address. A successful ping to it shows that TCP/IP is installed and working on the local host; it does not test any connectivity to other devices.';
  });
  fix(49, (q) => {
    q.question = 'Packet Tracer activity: trace the route from PC1 to PC2 (topology in the exhibit).';
    q.question2 = 'What are the three IPv6 addresses displayed when the route from PC1 to PC2 is traced? (Choose three.)';
    q.note = 'Nie da się zweryfikować bez pliku Packet Tracer (.pka) – odpowiedź pochodzi ze strony źródłowej.';
    q.unverified = true;
  });
  for (const id of [60, 65, 67]) fix(id, (q) => (q.explanation = COMPRESS));
  fix(75, (q) => {
    q.explanation = 'In an ICMPv4 Destination Unreachable message, code 0 means network unreachable, 1 host unreachable, 2 protocol unreachable and 3 port unreachable.';
  });
};
