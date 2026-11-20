import Banner from "@/components/Banner";
import RepairCategories from "@/components/Categories";
import FeaturedServices from "@/components/FeaturedServices";
import Howitworks from "@/components/Howitworks";

export default function Home() {
  return (
    <>
      <Banner />
      <FeaturedServices/>
      <RepairCategories/>
      <Howitworks/>
    </>
  );
}
