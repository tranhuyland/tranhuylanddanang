import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import ListingSection from "@/components/ListingSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string }>; }
const DISTRICT_MAP: Record<string, string> = {
  "hai-chau": "Hải Châu", "cam-le": "Cẩm Lệ", "thanh-khe": "Thanh Khê",
  "lien-chieu": "Liên Chiểu", "son-tra": "Sơn Trà", "ngu-hanh-son": "Ngũ Hành Sơn"
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dn = DISTRICT_MAP[slug];
  if (!dn) return { title: "Danh mục quận huyện" };
  return {
    title: `Mua Bán Nhà Đất Chính Chủ Quận ${dn} Đà Nẵng | Trần Huy Land`,
    description: `Danh sách nhà đất đang bán mới nhất, chính chủ, sổ đỏ sẵn sàng giao dịch tại Quận ${dn}, thành phố Đà Nẵng.`,
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const dn = DISTRICT_MAP[slug];
  if (!dn) notFound();
  
  const allData = await getBdsData();
  const filteredData = allData.filter(item => item.khuVuc === dn);

  return (
    <>
      <Header />
      <div className="bg-slate-900 text-white text-center py-12">
        <h1 class="text-2xl font-extrabold uppercase">Nhà Đất Quận {dn}</h1>
        <p className="text-slate-400 text-xs mt-2 font-medium">Kho hàng chính chủ • Khảo sát địa bàn thực tế</p>
      </div>
      <ListingSection allBdsItems={filteredData} forceDistrict={dn} />
      <Footer />
      <FloatingWidgets />
    </>
  );
}
