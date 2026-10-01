# Security

## Report a problem in private

Do not open a public issue for a security problem. Use GitHub's private report
instead: open the Security tab of this repository and choose "Report a
vulnerability".

If that button is missing, write to the contact address on the privacy page:
https://trycveditor.com/privacy

Say what you did, what happened and what you expected. A proof that works on the
sample CV is best. Do not send real CVs or other people's data.

One person runs this project and there is no bounty. The maintainer reads every
report, and credits you in the fix if you want that.

## In scope

- The code in this repository.
- The site at https://trycveditor.com.
- The promises on the privacy page: CVs never live on the server, and sign-in
  keeps no IP address, browser string, Google photo link or Google token.

## Out of scope

- Problems that need access to someone else's browser or device.
- Floods of requests. Each PDF request opens a real Chrome, so test the PDF
  route on a local copy.
- Bugs in Vercel, Neon, Google or Anthropic. Report those to them.

## Supported versions

Only the latest commit on `main`, because it is what runs in production.
