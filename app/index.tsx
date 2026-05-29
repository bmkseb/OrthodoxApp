import { Redirect } from 'expo-router';

/**
 * Root entry — every launch begins at the sacred welcome intro
 * (quote → brand reveal → actions). The user moves into the tabs from there,
 * either by signing in / creating an account, or by choosing "Continue as guest".
 */
export default function Index() {
  return <Redirect href="/auth/welcome" />;
}
