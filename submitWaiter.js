const axios = require('axios');

async function submitWaiter(email, username, UUID, referralLink) {
  try {
    const { data } = await axios({
      url: 'https://api.getwaitlist.com/api/v1/waiter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        waitlist_id: 14427,
        referral_link: referralLink,
        heartbeat_uuid: UUID,
        widget_type: 'WIDGET_1',
        email: email,
        answers: [
          { question_value: 'Your twitter handle', answer_value: username },
        ],
      },
    });

    if (!data.is_spam) {
      return { success: true, email, username, isSpam: false };
    } else {
      console.log(
        'Your account has been flagged as spam, waiting for 1 hour...'
      );
      return { success: false, isSpam: true };
    }
  } catch (error) {
    console.error('Error submitting referral: ' + error.message);
    return { success: false, isSpam: false };
  }
}

module.exports = submitWaiter;
