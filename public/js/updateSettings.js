import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/user/updateMyPassword'
        : 'http://localhost:3000/api/v1/user/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.status === 200) {
      showAlert('success', `${type.toUpperCase()} Updated Successfully`);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
