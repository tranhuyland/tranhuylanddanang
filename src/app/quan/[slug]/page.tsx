import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import ListingSection from "@/components/ListingSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const DISTRICT_MAP: Record<string, string> = {
  "hai-chau": "Hải Châu",
  "cam-le": "Cẩm Lệ",
  "thanh-khe": "Thanh Khê",
  "lien-chieu": "Liên Chiểu",
  "son-tra": "Sơn Trà",
  "ngu-hanh-son": "Ngũ Hành Sơn"
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const districtName = DISTRICT_MAP[slug];
  if (!districtName) return { title: "Danh mục quận huyện" };

  return {
    title: `Mua Bán Nhà Đất Chính Chủ Quận ${districtName} Đà Nẵng | Trần Huy Land`,
    description: `Danh sách nhà đất đang bán mới nhất, chính chủ tại Quận ${districtName}, Đà Nẵng. Pháp lý minh bạch có sẵn sổ đỏ trích lục quy hoạch xem ngay.`,
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const districtName = DISTRICT_MAP[slug];
  
  if (!districtName) notFound();
  
  const allData = await getBdsData();
  const filteredData = allData.filter(item => item.khuVuc === districtName);

  return (
    <>
      <Header />
      <div class="bg-slate-900 text-white text-center py-12">
        <h1 class="text-3xl font-extrabold uppercase">Nhà Đất Quận {districtName}</h1>
        <p class="text-slate-400 text-xs mt-2 font-medium">Kho sản phẩm chính chủ • Khảo sát thực tế • Không tin ảo</p>
      </div>
      <ListingSection allBdsItems={filteredData} forceDistrict={districtName} />
      <Footer />
      <FloatingWidgets />
    </>
  );
}
