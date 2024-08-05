import Head from 'next/head';
import MultiFilterList from '@/views/pages/MultiFilterList';

function Home() {
  return (
    <div style={{padding:'20px'}}>
      <Head>
        <title>Employee Data Grid</title>
        <meta name="description" content="Employee Data Grid with Filters" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main >
        <h1>Employee Data Grid</h1>
        <MultiFilterList />
      </main>
    </div>
  );
}

export default Home;
