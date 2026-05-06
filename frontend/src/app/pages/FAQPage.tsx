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
    id: "account-1",
    category: "Tài Khoản",
    question: "Làm thế nào để tạo tài khoản?",
    answer: "Bạn có thể tạo tài khoản bằng cách nhấn nút 'Đăng Ký' trên trang chủ. Sau đó điền email, mật khẩu và thông tin cá nhân của bạn. Một email xác nhận sẽ được gửi đến email của bạn, vui lòng nhấp vào liên kết xác nhận để hoàn tất đăng ký.",
  },
  {
    id: "account-2",
    category: "Tài Khoản",
    question: "Tôi quên mật khẩu, tôi phải làm gì?",
    answer: "Nhấn vào liên kết 'Quên Mật Khẩu' trên trang đăng nhập. Nhập email của bạn và bạn sẽ nhận được một email với liên kết để đặt lại mật khẩu của bạn.",
  },
  {
    id: "account-3",
    category: "Tài Khoản",
    question: "Tôi có thể thay đổi thông tin cá nhân của mình không?",
    answer: "Có, bạn có thể thay đổi thông tin cá nhân bằng cách vào mục 'Tài Khoản' > 'Thông Tin Tài Khoản' và cập nhật thông tin của bạn. Bạn cũng có thể thay đổi mật khẩu trong mục 'Đổi Mật Khẩu'.",
  },
  {
    id: "rental-1",
    category: "Thuê Máy",
    question: "Cách thức thuê máy của bạn hoạt động như thế nào?",
    answer: "Bạn có thể duyệt các gói máy tính khác nhau trên trang 'Máy Tính' hoặc 'Gói Giá'. Chọn một gói, xem chi tiết máy và nhấn 'Đặt Thuê'. Sau đó thanh toán và máy của bạn sẽ được kích hoạt ngay lập tức.",
  },
  {
    id: "rental-2",
    category: "Thuê Máy",
    question: "Các gói thuê máy có những tính năng gì?",
    answer: "Mỗi gói thuê máy có CPU, RAM, dung lượng lưu trữ, thời gian thuê và giá khác nhau. Bạn có thể xem chi tiết đầy đủ của mỗi gói trước khi đặt thuê. Tất cả các gói đều hỗ trợ truy cập từ xa 24/7.",
  },
  {
    id: "rental-3",
    category: "Thuê Máy",
    question: "Thời gian thuê tối thiểu là bao lâu?",
    answer: "Thời gian thuê tối thiểu phụ thuộc vào gói bạn chọn. Hầu hết các gói có thể được thuê từ 1 giờ trở lên. Bạn có thể xem chi tiết thời gian thuê trong mô tả gói.",
  },
  {
    id: "rental-4",
    category: "Thuê Máy",
    question: "Tôi có thể gia hạn hoặc hủy đơn thuê không?",
    answer: "Bạn có thể xem lịch sử đơn thuê của mình trong mục 'Tài Khoản' > 'Lịch Sử Thuê'. Tại đây bạn có thể xem thông tin chi tiết về mỗi đơn. Để gia hạn hoặc hủy, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.",
  },
  {
    id: "payment-1",
    category: "Thanh Toán",
    question: "Những phương thức thanh toán nào mà bạn chấp nhận?",
    answer: "Chúng tôi chấp nhận thanh toán qua ví điện tử. Bạn có thể nạp tiền vào ví của mình từ mục 'Ví' > 'Nạp Tiền'. Sau khi nạp tiền, bạn có thể sử dụng số dư trong ví để thanh toán cho các dịch vụ của chúng tôi.",
  },
  {
    id: "payment-2",
    category: "Thanh Toán",
    question: "Tôi có thể nạp tiền vào ví của mình bằng cách nào?",
    answer: "Bạn có thể nạp tiền vào ví bằng cách vào mục 'Ví' > 'Nạp Tiền', chọn số tiền muốn nạp, chọn phương thức thanh toán và làm theo hướng dẫn. Tiền sẽ được cộng vào ví của bạn ngay lập tức sau khi thanh toán thành công.",
  },
  {
    id: "payment-3",
    category: "Thanh Toán",
    question: "Tôi có thể rút tiền từ ví của mình không?",
    answer: "Hiện tại, chúng tôi chưa hỗ trợ rút tiền từ ví. Tuy nhiên, bạn có thể sử dụng số dư trong ví để thanh toán cho các dịch vụ của chúng tôi hoặc liên hệ với bộ phận hỗ trợ khách hàng để được hỗ trợ.",
  },
  {
    id: "payment-4",
    category: "Thanh Toán",
    question: "Tôi có thể xem hóa đơn nạp tiền của mình ở đâu?",
    answer: "Bạn có thể xem tất cả hóa đơn nạp tiền của mình trong mục 'Tài Khoản' > 'Hóa Đơn Nạp Tiền'. Tại đây bạn có thể xem chi tiết từng giao dịch nạp tiền.",
  },
  {
    id: "technical-1",
    category: "Vấn Đề Kỹ Thuật",
    question: "Tôi không thể kết nối đến máy tính được thuê, tôi phải làm gì?",
    answer: "Vui lòng kiểm tra kết nối internet của bạn. Nếu kết nối bình thường, hãy thử làm mới trình duyệt hoặc thử lại kết nối. Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật của chúng tôi.",
  },
  {
    id: "technical-2",
    category: "Vấn Đề Kỹ Thuật",
    question: "Hiệu suất máy tính bị chậm, tôi có thể làm gì?",
    answer: "Hiệu suất máy tính có thể bị ảnh hưởng bởi kết nối internet của bạn hoặc các chương trình chạy trên máy. Hãy thử tắt các chương trình không cần thiết hoặc nâng cấp gói máy tính của bạn để có hiệu suất tốt hơn.",
  },
  {
    id: "technical-3",
    category: "Vấn Đề Kỹ Thuật",
    question: "Tôi có thể cài đặt phần mềm trên máy tính được thuê không?",
    answer: "Có, bạn có thể cài đặt bất kỳ phần mềm nào mà bạn cần trên máy tính được thuê. Bạn có quyền truy cập đầy đủ vào hệ điều hành và có thể cài đặt các ứng dụng tùy ý.",
  },
  {
    id: "support-1",
    category: "Hỗ Trợ",
    question: "Làm cách nào để liên hệ với bộ phận hỗ trợ khách hàng?",
    answer: "Bạn có thể liên hệ với bộ phận hỗ trợ khách hàng thông qua email hoặc chat trực tiếp trên trang web. Chúng tôi có đội hỗ trợ sẵn sàng giúp bạn 24/7.",
  },
  {
    id: "support-2",
    category: "Hỗ Trợ",
    question: "Thời gian phản hồi của bộ phận hỗ trợ là bao lâu?",
    answer: "Chúng tôi cam kết phản hồi các yêu cầu hỗ trợ trong vòng 24 giờ. Đối với các vấn đề khẩn cấp, chúng tôi sẽ cố gắng phản hồi nhanh hơn.",
  },
];

export function FAQPage() {
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
            Câu Hỏi Thường Gặp
          </h1>
          <p className="text-muted-foreground text-lg">
            Tìm câu trả lời cho những câu hỏi thường gặp về dịch vụ của chúng tôi
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
                  <p className="text-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-8 mt-12 border-border bg-muted/50">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy câu trả lời?</h2>
          <p className="text-muted-foreground mb-6">
            Nếu bạn có câu hỏi khác, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi. Chúng tôi sẵn sàng giúp bạn.
          </p>
          <div className="space-y-2">
            <p className="text-foreground">
              <strong>Email:</strong> support@onnet-pc.com
            </p>
            <p className="text-foreground">
              <strong>Chat:</strong> Nhấp vào biểu tượng chat ở góc phải dưới để trò chuyện với chúng tôi
            </p>
          </div>
        </Card>
      </div>
      </div>
      <Footer />
    </>
  );
}
