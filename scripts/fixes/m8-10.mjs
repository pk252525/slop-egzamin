// Modules 8–10: corrections and additions from verification (see README).
const PKA = 'Nie da się zweryfikować bez pliku Packet Tracer (.pka) – odpowiedź pochodzi ze strony źródłowej.';

// "Refer to the exhibit" questions whose router configuration was parsed as the answer list
function gatewayQuestion(q, answer) {
  const [question, ...options] = q.raw.after.split('\n');
  q.exhibit = q.options.join('\n');
  q.question = question;
  q.options = options;
  q.correct = [options.indexOf(answer)];
}

export default ({ fix }) => {
  fix(1, (q) => {
    q.explanation = 'Routers forward packets based on the destination IP address. The data-link addresses change on every link, and the source IP address is not used for the forwarding decision.';
  });
  fix(2, (q) => {
    q.explanation = 'If the destination is on the same local network, the host sends the packet directly to it. Only packets for remote networks are sent to the default gateway.';
  });
  fix(3, (q) => {
    q.explanation = 'After the routing table lookup determines the exit interface, the router encapsulates the packet in a new Layer 2 frame for the outgoing link (for Ethernet with a new source and destination MAC address).';
  });
  fix(4, (q) => {
    q.explanation = 'The 127.0.0.0/8 range is reserved for loopback; 127.0.0.1 is the address normally used to test the TCP/IP stack of the local host. 127.0.0.0 is the network address and cannot be pinged.';
  });
  fix(5, (q) => {
    q.explanation = 'Communication on the local network works, so the cabling, IP address and subnet mask are correct. Traffic to other networks goes through the default gateway, so an invalid default gateway address is the probable cause.';
  });
  fix(8, (q) => {
    q.explanation = 'When there are several routes to the same destination network, the router selects the one with the lowest metric (the best path).';
  });
  fix(15, (q) => {
    q.images = q.raw.images.slice(0, 1); // the routing table; the second image is the solution
  });
  fix(26, (q) => {
    q.question = 'Which two types of IPv6 messages are used in place of ARP for address resolution? (Choose two.)';
  });
  fix(31, (q) => {
    q.explanation = 'banner motd sets the message displayed when someone accesses the router, password in line configuration mode secures the console, and hostname configures the device name.';
  });
  fix(34, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'perform the POST and load the bootstrap program', right: 'phase 1' },
      { left: 'locate and load the Cisco IOS software', right: 'phase 2' },
      { left: 'locate and load the startup configuration file', right: 'phase 3' },
    ];
    delete q.images;
    q.note = 'Pary przepisane z obrazka na stronie źródłowej (w HTML nie było tekstu).';
  });
  fix(39, (q) => {
    q.explanation = 'transport input ssh allows only SSH connections on the vty lines, so all communication between the switch and remote users is encrypted. Telnet connections are refused.';
  });
  fix(40, (q) => {
    q.explanation = 'The first hop in the tracert output is the default gateway of the user PC, 172.20.0.254. Packets for remote networks are always sent to the default gateway first.';
  });
  fix(48, (q) => {
    q.question = 'Packet Tracer activity: routers R1 and R2 have been configured (topology in the exhibit). Use a command to verify the configuration of the interfaces in both routers.';
    q.question2 = 'Which interfaces in each router are active and operational?';
    q.type = 'choice';
    q.options = [
      'R1: G0/0 and S0/0/0; R2: G0/0 and S0/0/0',
      'R1: G0/1 and S0/0/1; R2: G0/0 and S0/0/1',
      'R1: G0/0 and S0/0/0; R2: G0/1 and S0/0/0',
      'R1: G0/0 and S0/0/1; R2: G0/1 and S0/0/1',
    ];
    q.correct = [2];
    q.note = PKA;
    q.unverified = true;
  });
  fix(50, (q) => {
    q.explanation = 'The 8-bit Differentiated Services (DS) field, formerly Type of Service, is used to determine the priority of each packet (QoS).';
  });
  fix(59, (q) => {
    q.explanation = 'Every ARP table entry is time-stamped and removed when its timer expires, so a cached mapping stays in memory only until the timeout.';
  });
  fix(60, (q) => {
    q.explanation = 'Static ARP entries are entered manually and do not expire, so the MAC addresses of frequently used servers can be fixed in the ARP table.';
  });
  fix(69, (q) => {
    q.explanation = 'The interface described as "Connects to the Service LAN" has the address 172.29.157.156, so this is the default gateway for hosts on the Service LAN.';
  });
  fix(70, (q) => gatewayQuestion(q, '192.168.191.189'));
  fix(74, (q) => {
    q.explanation = 'The interface described as "Connects to the Store LAN" has the address 172.20.132.13, so this is the default gateway for hosts on the Store LAN.';
  });
  fix(76, (q) => gatewayQuestion(q, '192.168.201.200'));
};
