import Head from 'next/head';
import DataGridList from '@/oldIsGold/DataGridList';

function Home() {
  return (
    <div>
      <Head>
        <title>Employee Data Grid</title>
        <meta name="description" content="Employee Data Grid with Filters" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Employee Data Grid</h1>
        <DataGridList />
      </main>
    </div>
  );
}

export default Home;
