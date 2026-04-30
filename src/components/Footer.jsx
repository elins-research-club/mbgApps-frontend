// /frontend/src/components/Footer.js

const Footer = () => {
  return (
    <footer className="bg-[#F5F5F0] border-t border-[#F5F5F0]">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-black">
          © {new Date().getFullYear()} FMIPA UGM.
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
