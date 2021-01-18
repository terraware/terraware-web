export const getSummaryUpdates = async (): Promise<any> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/summary/updates`;
  try {
    const res = await fetch(endpoint)
    // eslint-disable-next-line no-console
    console.log({ res });
    const data = await res.json();

    return data;
  }
  catch (ex) {
    // eslint-disable-next-line no-console
    console.log({ endpoint, ex });
    return {}
  }
}
