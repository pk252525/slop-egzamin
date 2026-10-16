// Modules 1–3: corrections and additions from verification (see README).
export default ({ fix, all }) => {
  // exhibits here were transcribed to text, so the images are not needed
  all().forEach((q) => delete q.images);

  // --- verification: fixes and additions ---
  fix(5, q => {
    q.distractors = ['Match the type of communication with a specific priority.', 'Ensure that streaming data is provided over high speed links.'];
    q.pairs = q.pairs.map(p => ({ left: p.right, right: p.left }));
    q.explanation = 'Fault tolerance limits the impact of a failure through redundant links and devices. Scalability lets the network grow without degrading service for existing users. Security protects the network from unauthorized access. The remaining descriptions refer to Quality of Service (QoS).';
  });
  fix(18, q => {
    q.exhibit = 'SW1(config)# enable password letmein\nSW1(config)# enable secret secretin\nSW1(config)# line console 0\nSW1(config-line)# password lineconin\nSW1(config-line)# login\nSW1(config-line)# exit\nSW1(config)# line vty 0 15\nSW1(config-line)# password linevtyin\nSW1(config-line)# login\nSW1(config-line)# end\nSW1#';
    q.explanation = 'A console connection uses the password configured under "line console 0" (lineconin) to reach user EXEC mode. The VTY password (linevtyin) is used for Telnet/SSH, and the enable secret (secretin, which overrides enable password letmein) is needed to enter privileged EXEC mode.';
    q.note = 'Poprawiono wyjaśnienie: oryginał opisywał dostęp VTY/Telnet, a pytanie dotyczy połączenia konsolowego.';
  });
  fix(19, q => {
    q.question = 'A technician configures a switch with these commands:';
    q.exhibit = 'SwitchA(config)# interface vlan 1\nSwitchA(config-if)# ip address 192.168.1.1 255.255.255.0\nSwitchA(config-if)# no shutdown';
    q.question2 = 'What is the technician configuring?';
  });
  fix(24, q => {
    q.question = 'An administrator is configuring a switch console port with a password. In what order will the administrator travel through the IOS modes of operation in order to reach the mode in which the configuration commands will be entered?';
  });
  fix(27, q => {
    q.type = 'match';
    q.pairs = [
      { left: 'limited number of basic monitoring commands', right: 'user EXEC mode' },
      { left: 'the first entrance into the CLI of an IOS device', right: 'user EXEC mode' },
      { left: 'accessed by entering the enable command', right: 'privileged EXEC mode' },
      { left: 'identified by a prompt ending with the # character', right: 'privileged EXEC mode' },
      { left: 'changes made affect the operation of the device as a whole', right: 'global configuration mode' },
      { left: 'accessed by entering the configure terminal command', right: 'global configuration mode' },
      { left: 'used to enable the password for vty lines', right: null },
    ];
    q.explanation = 'User EXEC mode is the first CLI mode and allows only basic monitoring commands (prompt ">"). The enable command enters privileged EXEC mode (prompt "#"). The configure terminal command enters global configuration mode, where changes affect the device as a whole. The vty password is set in line configuration mode, which is not among the options.';
    q.note = 'Pary odtworzone z obrazka na stronie źródłowej (w HTML nie było tekstu).';
  });
  fix(28, q => {
    q.explanation = 'Tab completes a partially typed command or keyword; Space bar shows the next screen; ? gives context-sensitive help; Up Arrow scrolls back through previously entered commands; Ctrl-Shift-6 aborts commands such as ping and traceroute.';
  });
  fix(36, q => {
    q.type = 'match';
    q.pairs = [
      { left: 'This organization promotes the open development, evolution, and use of the Internet throughout the world.', right: 'ISOC' },
      { left: 'This organization is the largest developer of international standards in the world for a wide variety of products and services. It is known for its Open Systems Interconnection (OSI) reference model.', right: 'ISO' },
      { left: 'This organization is responsible for overseeing and managing IP address allocation, domain name management, and protocol identifiers.', right: 'IANA' },
    ];
    q.distractors = ['EIA'];
    q.explanation = 'ISOC (Internet Society) promotes the open development and use of the Internet. ISO develops international standards and is known for the OSI model. IANA manages IP address allocation, domain names and protocol identifiers. EIA is not used – it is known for standards related to electrical wiring, connectors and 19-inch racks.';
    q.note = 'Pary odtworzone z obrazka na stronie źródłowej (w HTML nie było tekstu).';
  });
  fix(38, q => { q.topic = '2.7.1'; q.explanation = 'The subnet mask determines which part of an IPv4 address is the network portion and which part is the host portion.'; });
  fix(41, q => { q.topic = '3.6.4'; q.explanation = 'Encapsulation goes from the top layer down: the application layer passes the Telnet data, the transport layer adds the TCP header (segment), the internet layer adds the IP header (packet), and finally the network access layer adds the Ethernet header (frame).'; });
  fix(43, q => { q.exhibit = 'HostA — SwitchA — RouterA ~~(WAN)~~ RouterB — SwitchB — ServerB'; });
  fix(47, q => { q.explanation = q.explanation.replace('edded', 'added'); });
  fix(52, q => {
    q.question = 'Packet Tracer activity: PC0 is connected to Switch0. What is the IP address of the switch virtual interface (SVI) on Switch0?';
    q.note = 'Nie da się zweryfikować bez pliku Packet Tracer (.pka) – odpowiedź pochodzi ze strony źródłowej.';
    q.unverified = true;
  });
  fix(54, q => { q.exhibit = "Switch1> config t\n          ^\n% Invalid input detected at '^' marker."; });
  fix(59, q => { q.topic = '1.2.2'; q.explanation = 'In the client/server model, server software runs on dedicated computers that serve requests from clients. In a peer-to-peer network, by contrast, one computer can be both client and server.'; });
  fix(65, q => { q.explanation = 'The source and destination IP addresses (logical addresses) are added at the network layer (Layer 3), creating a packet.'; });
  fix(73, q => { q.explanation = 'The source and destination MAC addresses (physical addresses) are added at the data link layer (Layer 2), creating a frame.'; });
  fix(74, q => {
    q.options = q.options.map(o => o === 'Fire optic cable' ? 'Fiber-optic cable' : o);
    q.note = 'Poprawiono literówkę w odpowiedzi ("Fire optic" → "Fiber-optic").';
    q.explanation = 'Fiber-optic cable carries data encoded as pulses of light. Copper cable uses electrical pulses, and wireless uses electromagnetic waves.';
  });
  fix(75, q => { q.question = 'Which two devices are intermediary devices? (Choose two.)'; });
};
