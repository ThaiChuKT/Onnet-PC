import { useState } from "react";
import { Card } from "../components/ui/card";
import { ChevronDown } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FAQItems: FAQItem[] = [
  {
    id: "dashboard-1",
    category: "Dashboard",
    question: "Cách sử dụng bảng điều khiển doanh thu?",
    answer: "Bảng điều khiển doanh thu cho phép bạn theo dõi tất cả doanh thu từ nạp ví, đặt máy và các giao dịch khác. Bạn có thể xem doanh thu theo tháng, phân khúc, và lịch sử chi tiết bằng cách nhấp vào các mục trên biểu đồ.",
  },
  {
    id: "dashboard-2",
    category: "Dashboard",
    question: "Làm cách nào để lọc doanh thu theo ngày?",
    answer: "Bạn có thể lọc doanh thu bằng cách nhập 'Từ ngày' và 'Đến ngày' trong phần bộ lọc ngày. Sau đó nhấp Enter hoặc chuyển sang ô khác, doanh thu sẽ được cập nhật theo khoảng thời gian bạn chọn.",
  },
  {
    id: "dashboard-3",
    category: "Dashboard",
    question: "Các số liệu trên bảng điều khiển có nghĩa là gì?",
    answer: "- Doanh thu từ nạp ví: Tổng tiền từ khách hàng nạp vào ví\n- Tổng đơn hàng: Số lượng đơn thuê máy\n- Doanh thu từ khách đặt máy: Tổng tiền từ đơn thuê máy\n- Khách hàng: Tổng số khách hàng có giao dịch",
  },
  {
    id: "dashboard-4",
    category: "Dashboard",
    question: "Tôi có thể xem chi tiết doanh thu của một tháng cụ thể không?",
    answer: "Có, bạn có thể nhấp vào bất kỳ điểm hoặc cột nào trên biểu đồ để xem chi tiết doanh thu của tháng đó. Sẽ hiển thị danh sách tất cả các giao dịch nạp ví hoặc đơn thuê máy trong tháng đó.",
  },
  {
    id: "dashboard-5",
    category: "Dashboard",
    question: "Doanh thu theo phân khúc là gì?",
    answer: "Doanh thu theo phân khúc cho bạn thấy doanh thu từ mỗi loại máy tính (gói). Bạn có thể xem tổng doanh thu, tỷ lệ phần trăm, số khách hàng sử dụng, và số lượt đơn hàng cho mỗi phân khúc.",
  },
  {
    id: "dashboard-6",
    category: "Dashboard",
    question: "Cách lọc doanh thu theo phân khúc?",
    answer: "Bạn có thể lọc doanh thu theo phân khúc bằng ba cách:\n1. Tìm kiếm theo tên: Nhập tên phân khúc trong ô 'Tìm kiếm phân khúc'\n2. Lọc theo doanh thu: Nhập doanh thu tối thiểu và tối đa\n3. Lọc theo số khách hàng: Nhập số khách hàng tối thiểu và tối đa\nNhấp 'Xóa bộ lọc' để đặt lại các lựa chọn.",
  },
  {
    id: "account-1",
    category: "Quản Lý Tài Khoản",
    question: "Làm cách nào để quản lý tài khoản khách hàng?",
    answer: "Bạn có thể xem và quản lý tất cả tài khoản khách hàng trong mục 'Quản Lý Tài Khoản'. Tại đây bạn có thể xem thông tin cơ bản, lịch sử giao dịch, và trạng thái kích hoạt của mỗi tài khoản.",
  },
  {
    id: "order-1",
    category: "Quản Lý Đơn Hàng",
    question: "Cách xem chi tiết đơn hàng?",
    answer: "Bạn có thể xem chi tiết đơn hàng trong mục 'Quản Lý Đơn Hàng'. Sẽ hiển thị danh sách tất cả các đơn đặt máy với thông tin về khách hàng, gói máy, giá tiền, thời gian, và trạng thái.",
  },
  {
    id: "order-2",
    category: "Quản Lý Đơn Hàng",
    question: "Đơn hàng ở những trạng thái nào?",
    answer: "Các trạng thái đơn hàng bao gồm:\n- Đang chờ xử lý: Đơn hàng mới vừa được tạo\n- Đã thanh toán: Khách hàng đã thanh toán\n- Hoạt động: Khách hàng đang sử dụng máy\n- Hoàn tất: Thời gian thuê đã kết thúc\n- Đã hủy: Khách hàng hủy đơn hàng",
  },
  {
    id: "invoice-1",
    category: "Quản Lý Hóa Đơn",
    question: "Cách xem lịch sử nạp tiền khách hàng?",
    answer: "Bạn có thể xem lịch sử nạp tiền của tất cả khách hàng trong mục 'Quản Lý Hóa Đơn'. Sẽ hiển thị danh sách tất cả các giao dịch nạp tiền với thông tin về số tiền, ngày nạp, và trạng thái.",
  },
  {
    id: "invoice-2",
    category: "Quản Lý Hóa Đơn",
    question: "Tôi có thể lọc hóa đơn theo ngày không?",
    answer: "Có, bạn có thể lọc hóa đơn theo ngày trong phần bộ lọc. Bạn cũng có thể tìm kiếm theo email khách hàng hoặc ID giao dịch.",
  },
  {
    id: "computer-1",
    category: "Quản Lý Máy Tính",
    question: "Làm cách nào để thêm máy tính mới?",
    answer: "Bạn có thể thêm máy tính mới trong mục 'Quản Lý Máy Tính'. Nhấp 'Thêm Máy Tính' và điền các thông tin như tên, CPU, RAM, dung lượng lưu trữ, v.v... Sau đó nhấp 'Lưu' để tạo máy tính mới.",
  },
  {
    id: "computer-2",
    category: "Quản Lý Máy Tính",
    question: "Cách chỉnh sửa thông tin máy tính?",
    answer: "Bạn có thể chỉnh sửa thông tin máy tính bằng cách nhấp vào máy tính trong danh sách và chọn 'Chỉnh Sửa'. Cập nhật thông tin cần thiết và nhấp 'Lưu'.",
  },
  {
    id: "computer-3",
    category: "Quản Lý Máy Tính",
    question: "Làm cách nào để xóa một máy tính?",
    answer: "Bạn có thể xóa máy tính bằng cách nhấp vào máy tính trong danh sách và chọn 'Xóa'. Lưu ý: Bạn chỉ có thể xóa máy tính nếu không có đơn đặt máy nào đang hoạt động cho máy đó.",
  },
  {
    id: "package-1",
    category: "Quản Lý Gói",
    question: "Làm cách nào để tạo gói giá mới?",
    answer: "Bạn có thể tạo gói giá mới trong mục 'Gói Giá'. Nhấp 'Thêm Gói' và điền các thông tin như tên gói, CPU, RAM, giá tiền, thời gian thuê, v.v... Sau đó nhấp 'Lưu' để tạo gói mới.",
  },
  {
    id: "package-2",
    category: "Quản Lý Gói",
    question: "Cách chỉnh sửa giá gói?",
    answer: "Bạn có thể chỉnh sửa giá gói bằng cách nhấp vào gói trong danh sách và chọn 'Chỉnh Sửa'. Cập nhật giá tiền và thông tin khác nếu cần, sau đó nhấp 'Lưu'.",
  },
  {
    id: "package-3",
    category: "Quản Lý Gói",
    question: "Có thể xóa gói giá không?",
    answer: "Bạn có thể xóa gói giá nếu không có máy tính nào liên kết với gói đó. Nếu gói đã có máy tính liên kết, vui lòng cập nhật các máy đó sang gói khác trước khi xóa.",
  },
  {
    id: "report-1",
    category: "Báo Cáo",
    question: "Cách tạo báo cáo doanh thu?",
    answer: "Bảng điều khiển doanh thu chính là công cụ tạo báo cáo doanh thu. Bạn có thể lọc dữ liệu theo ngày, tháng, hoặc phân khúc, và sau đó export hoặc in báo cáo.",
  },
  {
    id: "report-2",
    category: "Báo Cáo",
    question: "Tôi có thể so sánh doanh thu giữa các tháng không?",
    answer: "Có, biểu đồ doanh thu cho phép bạn so sánh doanh thu giữa các tháng khác nhau. Bạn có thể chọn 'Biểu Đồ Top Up' hoặc 'Biểu Đồ Booking' để xem so sánh doanh thu theo từng loại giao dịch.",
  },
  {
    id: "session-1",
    category: "Quản Lý Phiên",
    question: "Cách quản lý phiên khách hàng?",
    answer: "Bạn có thể quản lý phiên khách hàng trong mục 'Quản Lý Phiên'. Tại đây bạn có thể xem tất cả phiên đang hoạt động, thời gian kết nối, và có thể ngắt kết nối nếu cần thiết.",
  },
  {
    id: "session-2",
    category: "Quản Lý Phiên",
    question: "Tôi có thể ngắt kết nối khách hàng không?",
    answer: "Có, bạn có thể ngắt kết nối khách hàng bằng cách nhấp vào phiên trong danh sách và chọn 'Ngắt Kết Nối'. Điều này sẽ đóng kết nối từ xa của khách hàng đến máy tính.",
  },
];

export function AdminFAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(FAQItems.map((item) => item.category)));
  const filteredItems = selectedCategory
    ? FAQItems.filter((item) => item.category === selectedCategory)
    : FAQItems;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Hướng Dẫn Quản Lý
          </h1>
          <p className="text-muted-foreground text-lg">
            Hướng dẫn chi tiết về cách sử dụng bảng điều khiển quản lý
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tất Cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-border overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full p-6 flex items-start justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{item.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground ml-4 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <Card className="p-8 mt-12 border-border bg-muted/50">
          <h2 className="text-2xl font-bold mb-4">Cần Hỗ Trợ?</h2>
          <p className="text-muted-foreground mb-6">
            Nếu bạn cần hỗ trợ kỹ thuật hoặc có câu hỏi về hệ thống, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật.
          </p>
          <div className="space-y-2">
            <p className="text-foreground">
              <strong>Email:</strong> tech-support@onnet-pc.com
            </p>
            <p className="text-foreground">
              <strong>Internal Chat:</strong> Sử dụng hệ thống chat nội bộ
            </p>
          </div>
        </Card>
      </div>
      </div>
      <Footer />
    </>
  );
}
