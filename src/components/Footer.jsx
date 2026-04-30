// /frontend/src/components/Footer.js

const Footer = () => {
  return (
    <footer className="bg-[#452829] border-t border-[#452829]">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-white">
          © {new Date().getFullYear()} FMIPA UGM.
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
