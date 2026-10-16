// Modules 16–17: corrections and additions from verification (see README).
const IMG = 'Pary przepisane z obrazka na stronie źródłowej (w HTML nie było tekstu).';
const STRONG = 'A strong password has at least 8 (preferably 10 or more) characters and mixes upper and lowercase letters, numbers and special characters, or is a long passphrase. Weak passwords are default or commonly used passwords, dictionary words, simple series of numbers or letters, and personal information such as names or birthdays.';

export default ({ fix }) => {
  fix(1, (q) => {
    q.explanation = 'A firewall controls the traffic allowed to and from a computer or network and blocks unauthorized communications. Antivirus and antimalware software detect malicious code; a port scanner is a reconnaissance tool.';
  });
  fix(2, (q) => {
    q.explanation = 'The syntax is login block-for seconds attempts tries within seconds, so login block-for 30 attempts 2 within 10 blocks logins for 30 seconds after 2 failed attempts within 10 seconds.';
  });
  fix(3, (q) => {
    q.explanation = 'In AAA, authentication proves who the user is, authorization determines which resources the user can access, and accounting keeps track of what the user does.';
  });
  fix(4, (q) => {
    q.explanation = 'Reconnaissance attacks gather information about the network: nslookup queries DNS for domain information and fping performs ping sweeps to discover active IP addresses.';
  });
  fix(5, (q) => {
    q.distractors = ['An employee is trying to guess the password of another user.'];
  });
  fix(6, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'information theft', right: 'obtaining trade secret documents illegally' },
      { left: 'identity theft', right: 'pretending to be someone else by using stolen personal information to apply for a credit card' },
      { left: 'data loss', right: 'installing virus code to destroy surveillance recordings for certain days' },
      { left: 'disruption of service', right: 'preventing users from accessing a website by sending a large number of link requests in a short period' },
    ];
    q.distractors = ['cracking the password of an administrator account on a server'];
    delete q.images;
    q.note = IMG;
  });
  fix(11, (q) => {
    q.type = 'match';
    q.pairs = [
      { left: 'prevents or allows access based on the port numbers used in the request', right: 'application filtering' },
      { left: 'prevents or allows access based on whether the traffic is in response to requests from internal hosts', right: 'stateful packet inspection' },
      { left: 'prevents or allows access based on web addresses or keywords', right: 'URL filtering' },
      { left: 'prevents or allows access based on the IP or MAC addresses of the source and destination', right: 'packet filtering' },
      { left: 'prevents or allows access based on the operating system of the source or destination device', right: null },
    ];
    delete q.images;
    q.note = IMG;
  });
  fix(15, (q) => {
    q.question = 'Identify the steps needed to configure a switch for SSH. (Choose five.)';
    q.type = 'choice';
    q.options = [
      'Create a local user.',
      'Generate RSA keys.',
      'Use the login command.',
      'Configure a domain name.',
      'Use the login local command.',
      'Use the password cisco command.',
      'Use the transport input ssh command.',
    ];
    q.correct = [0, 1, 3, 4, 6];
    delete q.images;
    q.note = 'W oryginale zadanie „przeciągnij” – odpowiedzi przepisane z obrazka i zamienione na wybór wielokrotny.';
  });
  fix(47, (q) => {
    q.question = 'Packet Tracer activity: SSH is being configured on the router (exhibit).';
    q.question2 = 'Which command has to be configured on the router to complete the SSH configuration?';
    q.note = 'Nie da się zweryfikować bez pliku Packet Tracer (.pka) – odpowiedź pochodzi ze strony źródłowej.';
    q.unverified = true;
  });
  for (let id = 48; id <= 56; id++) fix(id, (q) => (q.explanation = STRONG));
  fix(58, (q) => {
    q.explanation = 'show ip interface brief lists every interface of the router with its IPv4 address and its status and protocol state.';
  });
  fix(59, (q) => {
    q.explanation = 'show interfaces displays detailed interface statistics, including the speed and duplex settings and error counters such as collisions and late collisions caused by a duplex mismatch.';
  });
  fix(60, (q) => {
    q.explanation = 'On a Windows PC, ipconfig displays the IP address, subnet mask and default gateway of each network adapter.';
  });
  fix(61, (q) => {
    q.explanation = 'copy running-config startup-config saves the running configuration from RAM to the startup configuration in NVRAM.';
  });
  fix(62, (q) => {
    q.explanation = 'On macOS, ipconfig getifaddr en0 displays the IP address of interface en0, which is usually the wireless interface.';
  });
  fix(63, (q) => {
    q.explanation = 'show ipv6 interface (or show ipv6 interface brief) displays the IPv6 addresses configured on the router interfaces.';
  });
  fix(64, (q) => {
    q.explanation = 'On a Windows PC, ipconfig displays the configured default gateway together with the IP address and subnet mask.';
  });
  fix(65, (q) => {
    q.explanation = 'IPv6 routing is enabled with the global command ipv6 unicast-routing, which can be verified in the output of show running-config.';
  });
  fix(66, (q) => {
    q.explanation = 'nslookup queries a DNS server and returns the IP address of a domain name.';
  });
};
