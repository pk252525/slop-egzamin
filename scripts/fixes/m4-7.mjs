// Modules 4–7: corrections and additions from verification (see README).
export default ({ fix, columns }) => {
  fix(1, (q) => {
    q.explanation = 'The physical layer transmits the bits of a frame across the local media as electrical, light or radio signals. Media access control, error detection and frame exchange between nodes are data link layer functions.';
  });
  fix(2, (q) => {
    q.explanation = 'Light travels in only one direction over a strand of fiber, so one strand is used to transmit and the other to receive, which allows full-duplex communication.';
  });
  fix(3, (q) => {
    q.explanation = 'Crosstalk is interference caused by the electric or magnetic fields of a signal on one wire affecting the signal in an adjacent wire.';
  });
  fix(4, (q) => {
    q.explanation = 'UTP cable limits crosstalk by cancellation: the wires of each circuit pair are twisted together, so the magnetic fields of the opposing currents cancel each other out.';
  });
  fix(5, (q) => {
    q.pairs = columns(q.raw.expTables[0]);
    delete q.images; // the image shows the answers
    q.explanation = 'Copper cabling is used for horizontal cabling and desktop PCs in offices. Fiber-optic cabling is used for backbone cabling in an enterprise and for long-haul networks. Wireless is used where cabling is impractical, such as guest access in a coffee shop or hospital waiting rooms.';
  });
  fix(47, (q) => {
    q.question = 'Packet Tracer activity: PC0 pings the host with the IPv4 address 10.1.1.5 through Switch0 (topology in the exhibit).';
    q.question2 = 'Which port does Switch0 use to send frames to the host with the IPv4 address 10.1.1.5?';
    q.note = 'Nie da się zweryfikować bez pliku Packet Tracer (.pka) – odpowiedź pochodzi ze strony źródłowej.';
    q.unverified = true;
  });
  fix(73, (q) => {
    q.explanation = 'A destination MAC address beginning with 01-00-5E is an IPv4 multicast address. Unless the switch is configured for multicast snooping, it treats the frame like a broadcast and floods it out all ports except the one it was received on.';
  });
};
