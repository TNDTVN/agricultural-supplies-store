import { Order } from '@/types/order';
import { OrderDetail } from '@/types/orderdetails';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: '/font/static/Roboto-Regular.ttf' },
        { src: '/font/static/Roboto-Bold.ttf', fontWeight: 'bold' },
        { src: '/font/static/Roboto-Italic.ttf', fontStyle: 'italic' },
    ],
});

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Roboto',
        lineHeight: 1.4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 20,
    },
    companyInfo: {
        width: '100%',
    },
    invoiceInfo: {
        width: '50%',
        alignItems: 'flex-end',
    },
    logo: {
        width: 120,
        height: 100,
        marginBottom: 10,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#2c3e50',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#3498db',
        borderBottomWidth: 1,
        borderBottomColor: '#3498db',
        paddingBottom: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    col: {
        flexDirection: 'column',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        width: '30%',
    },
    value: {
        width: '70%',
    },
    table: {
        width: '100%',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
        minHeight: 30,
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        fontSize: 11,
    },
    tableCell: {
        padding: 8,
        textAlign: 'left',
        fontSize: 10,
    },
    productCell: {
        width: '30%',
    },
    numberCell: {
        width: '12%',
        textAlign: 'right',
    },
    totalSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalLabel: {
        width: '20%',
        fontWeight: 'bold',
        textAlign: 'right',
        paddingRight: 10,
    },
    totalValue: {
        width: '20%',
        textAlign: 'right',
    },
    grandTotal: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#e74c3c',
    },
    footer: {
        marginTop: 30,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signature: {
        width: '40%',
        alignItems: 'center',
        marginTop: 30,
    },
    signatureLine: {
        width: '80%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        marginTop: 40,
    },
    notes: {
        marginTop: 20,
        fontStyle: 'italic',
        fontSize: 9,
    },
});

interface InvoicePDFProps {
    order: Order & { orderDetails: OrderDetail[] };
}

const InvoicePDF = ({ order }: InvoicePDFProps) => {
    const subtotal = order.orderDetails.reduce(
        (sum, detail) => sum + detail.unitPrice * detail.quantity * (1 - detail.discount),
        0
    );
    const freight = order.freight || 0;
    const total = subtotal + freight;
    const grandTotal = total ;

    return (
        <Document>
        <Page size="A4" style={styles.page}>
            {/* Header with company and invoice info */}
            <View style={styles.header}>
            <View style={styles.companyInfo}>
                {/* Replace with your company logo */}
                <Image style={styles.logo} src={"/images/trans_bg.png"}/>
                <Text style={styles.companyName}>CỬA HÀNG VẬT TƯ NÔNG NGHIỆP FARMTECH</Text>
                <Text>Địa chỉ: Phạm Hữu Lầu, Phường 6, Cao Lãnh, Đồng Tháp</Text>
                <Text>Điện thoại: 0898543919</Text>
                <Text>Email: dhao30167@gmail.com</Text>
            </View>

            <View style={styles.invoiceInfo}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>HÓA ĐƠN BÁN HÀNG</Text>
                <Text>Mã hóa đơn: {order.orderID}</Text>
                <Text>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</Text>
                <Text>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</Text>
                {order.shippedDate && (
                <Text>Ngày giao: {new Date(order.shippedDate).toLocaleDateString('vi-VN')}</Text>
                )}
            </View>
            </View>

            {/* Customer and Order Information */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Tên khách hàng:</Text>
                <Text style={styles.value}>{order.customer?.customerName || 'Không xác định'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Địa chỉ:</Text>
                <Text style={styles.value}>{order.customer?.address || 'Không xác định'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Số điện thoại:</Text>
                <Text style={styles.value}>{order.customer?.phone || 'Không xác định'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{order.customer?.email || 'Không xác định'}</Text>
            </View>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>THÔNG TIN NHÂN VIÊN</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Nhân viên bán hàng:</Text>
                <Text style={styles.value}>
                {`${order.employee?.firstName || ''} ${order.employee?.lastName || ''}`.trim() ||
                    'Không xác định'}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Số điện thoại:</Text>
                <Text style={styles.value}>{order.employee?.phone || 'Không xác định'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{order.employee?.email || 'Không xác định'}</Text>
            </View>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>THÔNG TIN GIAO HÀNG</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Địa chỉ giao:</Text>
                <Text style={styles.value}>{order.shipAddress || 'Không xác định'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Phương thức thanh toán:</Text>
                <Text style={styles.value}>Tiền mặt khi nhận hàng</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Phí vận chuyển:</Text>
                <Text style={styles.value}>{freight.toLocaleString('vi-VN')} VND</Text>
            </View>
            </View>

            {/* Order Items Table */}
            <Text style={styles.sectionTitle}>CHI TIẾT ĐƠN HÀNG</Text>
            <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: '5%' }]}>STT</Text>
                <Text style={[styles.tableCell, styles.productCell]}>TÊN SẢN PHẨM</Text>
                <Text style={[styles.tableCell, styles.numberCell]}>ĐƠN GIÁ</Text>
                <Text style={[styles.tableCell, styles.numberCell]}>SL</Text>
                <Text style={[styles.tableCell, styles.numberCell]}>GIẢM GIÁ</Text>
                <Text style={[styles.tableCell, styles.numberCell]}>THÀNH TIỀN</Text>
            </View>

            {/* Table Rows */}
            {order.orderDetails.map((detail, index) => (
                <View style={styles.tableRow} key={detail.orderDetailID}>
                <Text style={[styles.tableCell, { width: '5%' }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.productCell]}>
                    {detail.product?.productName || `Sản phẩm #${detail.productID}`}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                    {detail.unitPrice.toLocaleString('vi-VN')}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>{detail.quantity}</Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                    {(detail.discount * 100).toFixed(2)}%
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                    {(detail.unitPrice * detail.quantity * (1 - detail.discount)).toLocaleString('vi-VN')}
                </Text>
                </View>
            ))}
            </View>

            {/* Totals Section */}
            <View style={styles.totalSection}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                <Text style={styles.totalValue}>{freight.toLocaleString('vi-VN')} VND</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={[styles.totalValue, styles.grandTotal]}>
                {total.toLocaleString('vi-VN')} VND
                </Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                <Text style={[styles.totalValue, styles.grandTotal]}>
                {grandTotal.toLocaleString('vi-VN')} VND
                </Text>
            </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
            <View style={styles.notes}>
                <Text>Ghi chú: {order.shipAddress || 'Không có ghi chú'}</Text>
                <Text>Hóa đơn có giá trị trong vòng 10 ngày kể từ ngày phát hành</Text>
            </View>

            <View style={styles.signature}>
                <Text>Người lập hóa đơn</Text>
                <View style={styles.signatureLine} />
                <Text style={{ marginTop: 5, fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</Text>
            </View>
            </View>
        </Page>
        </Document>
    );
};

export default InvoicePDF;