const axios = require('axios');
const emails = require('email-generator');
const readlineSync = require('readline-sync');
const colors = require('colors');
const UsernameGenerator = require('username-generator');
const { isValidHttpUrl, delay } = require('./utils');
const submitWaiter = require('./submitWaiter');

colors.setTheme({
  info: 'green',
  warn: 'yellow',
  error: 'red',
});

(async () => {
  try {
    let referralLink = '';
    while (true) {
      referralLink = readlineSync.question('Enter the referral link: '.info);
      if (isValidHttpUrl(referralLink)) {
        break;
      } else {
        console.log('Invalid URL. Please enter a valid referral link.'.warn);
      }
    }

    let numberOfReferrals = parseInt(
      readlineSync.question('How many referrals do you want to make? '.info)
    );

    if (isNaN(numberOfReferrals) || numberOfReferrals <= 0) {
      console.log('Please enter a valid number.'.warn);
      return;
    }

    let i = 0;
    while (i < numberOfReferrals) {
      const heartbeatResponse = await axios({
        url: 'https://api.getwaitlist.com/api/v1/widget_heartbeats',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          location: referralLink,
          waitlist_id: '14427',
          referrer: 'https://www.google.com/',
          widget_type: 'WIDGET_1',
        },
      });

      const heartbeatUUID = heartbeatResponse.data.uuid;
      const dummyEmail = emails.generateEmail();
      const dummyUsername = UsernameGenerator.generateUsername();

      const submissionResult = await submitWaiter(
        dummyEmail.slice(1, dummyEmail.length - 1),
        dummyUsername,
        heartbeatUUID,
        referralLink
      );

      if (submissionResult.success) {
        console.log(
          `${i + 1} referral has been added, the email is ${
            submissionResult.email
          } and the username is ${submissionResult.username}`.info
        );
        i++;
      }

      if (submissionResult.isSpam) {
        await delay(3600000);
        continue;
      }

      if (i < numberOfReferrals && !submissionResult.isSpam) {
        console.log(`Waiting for 1 minute before the next referral...`.info);
        await delay(60000);
      }
    }

    console.log('All referrals have been submitted.'.info);
  } catch (error) {
    console.error('An error occurred: ' + error.message);
  }
})();
