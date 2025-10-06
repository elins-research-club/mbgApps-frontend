// /frontend/src/components/Footer.js

const Footer = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Web Development Elins Research Club UGM.
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
