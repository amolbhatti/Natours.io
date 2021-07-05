/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://localhost:3000/api/v1/user/login`,
      data: { email, password },
    });
    console.log(res.status);

    if (res.status === 200) {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/user/logout');
    if (res.status === 200) {
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', 'Error logging out! try again');
  }
};
