import React, { useRef, useState } from "react";
import './Contact.css';

import {
  MdContactMail,
  MdEmail,
  MdTitle,
  MdArticle,
  MdLightbulb,
  MdSend,
} from 'react-icons/md';

import { FaUser } from 'react-icons/fa';
import { motion } from "framer-motion";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
  const formRef = useRef();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    query: "",
    suggestions: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.query.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const existingQueries = JSON.parse(
        localStorage.getItem("buykit_queries") || "[]"
      );

      const newQuery = {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        query: form.query.trim(),
        suggestions: form.suggestions.trim(),
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "buykit_queries",
        JSON.stringify([newQuery, ...existingQueries])
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        query: "",
        suggestions: "",
      });

      if (formRef.current) {
        formRef.current.reset();
      }

      toast.success("Your query has been submitted successfully!");
    } catch (error) {
      console.error("Query submission error:", error);
      toast.error("Unable to save your query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
    >

      {/* LEFT SIDE — ASK YOUR QUERY */}

      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.75] bg-black-100 p-8 rounded-2xl'
      >

        <p className={styles.sectionSubText}>
          Ask Your Query
        </p>

        <h3 className={styles.sectionHeadText}>
          Get In Touch.
          <MdContactMail className="inline-block" />
        </h3>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='mt-12 flex flex-col gap-8'
        >

          {/* YOUR NAME */}

          <label className='flex flex-col'>

            <span className='text-white font-medium mb-4 flex items-center gap-2'>
              <FaUser />
              Your Name
            </span>

            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              maxLength={100}
              required
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />

          </label>

          {/* EMAIL */}

          <label className='flex flex-col'>

            <span className='text-white font-medium mb-4 flex items-center gap-2'>
              <MdEmail />
              Your Email
            </span>

            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              maxLength={254}
              required
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />

          </label>

          {/* SUBJECT */}

          <label className='flex flex-col'>

            <span className='text-white font-medium mb-4 flex items-center gap-2'>
              <MdTitle />
              Subject
            </span>

            <input
              type='text'
              name='subject'
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter the subject of your query"
              maxLength={200}
              required
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />

          </label>

          {/* YOUR QUERY */}

          <label className='flex flex-col'>

            <span className='text-white font-medium mb-4 flex items-center gap-2'>
              <MdArticle />
              Your Query
            </span>

            <textarea
              rows={7}
              name='query'
              value={form.query}
              onChange={handleChange}
              placeholder="Write your query here..."
              maxLength={10000}
              required
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium resize-y'
            />

          </label>

          {/* SUGGESTIONS */}

          <label className='flex flex-col'>

            <span className='text-white font-medium mb-4 flex items-center gap-2'>
              <MdLightbulb />
              Suggestions
              <span className="text-secondary text-sm font-normal">
                (Optional)
              </span>
            </span>

            <textarea
              rows={5}
              name='suggestions'
              value={form.suggestions}
              onChange={handleChange}
              placeholder="Share your suggestions with us..."
              maxLength={5000}
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium resize-y'
            />

          </label>

          {/* SUBMIT BUTTON */}

          <button
            type='submit'
            disabled={loading}
            className='bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary disabled:opacity-50'
          >
            {loading ? "Submitting..." : "Submit Query"}
          </button>

        </form>

      </motion.div>

      {/* RIGHT SIDE — ORIGINAL EARTH CANVAS */}

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
      >
        <EarthCanvas />
      </motion.div>

      {/* TOAST NOTIFICATIONS */}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

    </div>
  );
};

export default SectionWrapper(Contact, "contact");