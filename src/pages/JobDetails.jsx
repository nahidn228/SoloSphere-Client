import axios from "axios";
import { compareAsc, format } from "date-fns";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../providers/AuthProvider";

const JobDetails = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [startDate, setStartDate] = useState(new Date());

  const [job, setJob] = useState([]);
  useEffect(() => {
    //make a post request
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    //make a get request
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/job/${id}`
    );
    setJob(data);
  };
  const {
    _id,
    title,
    deadline,
    category,
    buyer,
    min_price,
    max_price,
    description,
  } = job || {};

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const price = form.price.value;
    const email = form.email.value;
    const comment = form.comment.value;
    const date = startDate;
    const jobId = _id;

    //check bid permission validation
    if (user?.email === buyer?.email)
      return toast.error("Action Not permitted");

    //Deadline cross validation for bidding date
    const compareDate = compareAsc(new Date(date), new Date(deadline));
    if (compareDate === 1) {
      return toast.error("Offer a date within deadline");
    }
    //Deadline cross validation for running date
    const compareDate1 = compareAsc(new Date(), new Date(deadline));
    if (compareDate1 === 1)
      return toast.error("Deadline crossed, Bidding error");

    // maximum price validation
    if (price > max_price)
      return toast.error("Offer less or at lest equal to  maximum price!");

    const bidData = { price, email, comment, date, jobId };
    console.table(bidData);

    try {
      //make a post request
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-bid`,
        bidData
      );
      console.log(data);
      form.reset();
      toast.success("You are bidding Successfully!!!");
      // navigate("/my-bids");
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto ">
      {/* Job Details */}
      <div className="flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]">
        <div className="flex items-center justify-between">
          {deadline && (
            <span className="text-sm font-light text-gray-800 ">
              Deadline: {format(new Date(deadline), "P")}
            </span>
          )}
          <span className="px-4 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full ">
            {category}
          </span>
        </div>

        <div>
          <h1 className="mt-2 text-3xl font-semibold text-gray-800 ">
            {title}
          </h1>

          <p className="mt-2 text-lg text-gray-600 ">{description}</p>
          <p className="mt-6 text-sm font-bold text-gray-600 ">
            Buyer Details:
          </p>
          <div className="flex items-center gap-5">
            <div>
              <p className="mt-2 text-sm  text-gray-600 ">
                Name: {buyer?.name}
              </p>
              <p className="mt-2 text-sm  text-gray-600 ">
                Email: {buyer?.email}
              </p>
            </div>
            <div className="rounded-full object-cover overflow-hidden w-14 h-14">
              <img referrerPolicy="no-referrer" src={buyer?.photo} alt="" />
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-gray-600 ">
            Range: ${min_price} - ${max_price}
          </p>
        </div>
      </div>

      {/* Place A Bid Form */}
      <section className="p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]">
        <h2 className="text-lg font-semibold text-gray-700 capitalize ">
          Place A Bid
        </h2>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 " htmlFor="price">
                Price
              </label>
              <input
                id="price"
                type="text"
                name="price"
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="emailAddress">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                name="email"
                defaultValue={user?.email}
                disabled
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="comment">
                Comment
              </label>
              <input
                id="comment"
                name="comment"
                type="text"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label className="text-gray-700">Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className="border p-2 rounded-md"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default JobDetails;
