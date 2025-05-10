import axios from "axios";

export const getMessage = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/`);
  console.log(res.data);
  return res.data;
};
