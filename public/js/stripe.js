import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51HKAC6GcejTQJKnXSSwSGdhDgD7sQcADBZgEU18AdCfRKGex2WYofBnr50ifGj02yUHq3HocOgHzw0Byem6Q4TMx00VGGyYqNc'
);

export const bookTour = async (tourId) => {
  try {
    //1) get session from server
    const session = await axios(`/api/v1/booking/checkout-sessin/${tourId}`);
    console.log(session);
    //2) create checkout form + charge credit card for us
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
