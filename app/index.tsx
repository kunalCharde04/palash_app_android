import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Index() {
  const { accessToken } = useSelector((state: RootState) => state.authReducer);

  if (accessToken) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)" />;
}
