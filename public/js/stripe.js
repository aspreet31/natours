import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    //1) Session create
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //2. Create checkout form + charge credit card
    const checkoutPageUrl = session.data.data.url;
    window.location.assign(checkoutPageUrl);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
