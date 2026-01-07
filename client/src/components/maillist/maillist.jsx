import "./maillist.css";

const Maillist = () => {
  return (
    <div className="mail">
      <h1 className="mailtitle">Save time, save money!</h1>

      <span className="maildesc">
        A simple and reliable platform for finding rooms and rental stays.
      </span>

      <br />

      <span className="maildesc copyright">
        © {new Date().getFullYear()} Room Rently. All rights reserved.
      </span>
    </div>
  );
};

export default Maillist;
