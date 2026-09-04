import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const Home = () => {
  return (
    <div>
      <SEO title="Home" description="Find thousands of job opportunities across India, powered by the Government Skill Intelligence Platform." />
      <Hero />
      <JobListing />
      <AppDownload />
      <Footer />
    </div>
  )
}

export default Home