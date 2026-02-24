import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import defaultServiceImage from "../../../../assets/images/Service.png";
import { getActiveHero } from "../../../../services/heroService";

const ServiceImage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [serviceImage, setServiceImage] = useState<string>(defaultServiceImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceImage = async () => {
      try {
        const response = await getActiveHero();
        if (response.data.hero?.service_image) {
          setServiceImage(response.data.hero.service_image);
        }
      } catch (error) {
        console.error("Failed to fetch service image:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceImage();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 50, scale: 0.95 }
      }
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      className="w-full bg-[#3a4b95]"
    >
      {loading ? (
        <div className="animate-pulse bg-gray-200 w-full h-64 md:h-80 rounded-lg"></div>
      ) : (
        <motion.img
          src={serviceImage}
          alt="Service Image"
          className=" mx-auto h-auto object-cover"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default ServiceImage;
