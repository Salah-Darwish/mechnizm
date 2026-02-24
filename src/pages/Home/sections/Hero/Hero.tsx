import { motion } from "framer-motion";
import homeImage from "../../../../assets/images/HomeImage.jpeg";

const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      <div className="w-full">
        <img
          src={homeImage}
          alt="Hero Image"
          className="w-full mx-auto h-auto object-cover"
        />
      </div>
    </motion.div>
  );
};

export default Hero;
