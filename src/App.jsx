import { BrowserRouter, Routes, Route } from "react-router-dom";
import BlogEditor from "./components/BlogEditor";

import {
  About,
  Contact,
  Experience,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
  ScrollToTop,
  CTAButtons,
  Greeting,
} from "./components";

import ArticlePage from "./components/ArticlePage";

const Home = () => {
  return (
    <div className='relative z-0 bg-primary'>
      <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
        <Navbar />
        <Hero />
        <Greeting />
      </div>

      <About />
      <Works />
      <div className='relative z-0'>
        <Contact />
        <StarsCanvas />
      </div>

      <CTAButtons />
      <ScrollToTop />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* BuyKit Homepage */}
        <Route path="/" element={<Home />} />

        {/* Individual Blog Articles */}
        <Route path="/blog/:slug" element={<ArticlePage />} />

        <Route path="/write-blog" element={<BlogEditor />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;