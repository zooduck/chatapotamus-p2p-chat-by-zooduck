export default `
[
  {
    urls: 'stun:a.relay.metered.ca:80'
  },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: '<username>',
    credential: '<password>'
  },
  {
    urls: 'turn:a.relay.metered.ca:80?transport=tcp',
    username: '<username>',
    credential: '<password>'
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: '<username>',
    credential: '<password>'
  },
  {
    urls: 'turn:a.relay.metered.ca:443?transport=tcp',
    username: '<username>',
    credential: '<password>'
  }
]`.trim();
