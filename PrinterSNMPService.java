import org.snmp4j.*;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.springframework.stereotype.Service;

@Service
public class PrinterSNMPService {
    
    // تعريف OIDs للطابعة
    private static final String OID_PRINTER_NAME = "1.3.6.1.2.1.1.5.0";
    private static final String OID_SERIAL_NUMBER = "1.3.6.1.2.1.43.5.1.1.17.1";
    private static final String OID_MODEL = "1.3.6.1.2.1.25.3.2.1.3.1";
    private static final String OID_TOTAL_IMPRESSIONS = "1.3.6.1.4.1.253.8.53.13.2.1.6.1.20.1";
    private static final String OID_COLOR_PRINTS = "1.3.6.1.4.1.253.8.53.13.2.1.6.1.20.33";
    private static final String OID_BLACK_PRINTS = "1.3.6.1.4.1.253.8.53.13.2.1.6.1.20.34";
    
    public SNMPPrinterData getPrinterData(String ipAddress) throws Exception {
        TransportMapping<UdpAddress> transport = new DefaultUdpTransportMapping();
        transport.listen();

        CommunityTarget target = new CommunityTarget();
        target.setCommunity(new OctetString("public"));
        target.setAddress(new UdpAddress(ipAddress + "/161"));
        target.setRetries(2);
        target.setTimeout(1500);
        target.setVersion(SnmpConstants.version2c);

        Snmp snmp = new Snmp(transport);
        
        try {
            SNMPPrinterData printerData = new SNMPPrinterData();
            
            // قراءة المعلومات الأساسية
            printerData.setPrinterName(getSnmpValue(snmp, target, OID_PRINTER_NAME));
            printerData.setSerialNumber(getSnmpValue(snmp, target, OID_SERIAL_NUMBER));
            printerData.setModel(getSnmpValue(snmp, target, OID_MODEL));
            
            // تحديد نوع الطابعة (ملونة أم أسود)
            boolean isColor = checkIfColorPrinter(snmp, target);
            printerData.setType(isColor ? "color" : "bw");
            
            // قراءة العدادات
            printerData.setCounters(new Counters(
                Long.parseLong(getSnmpValue(snmp, target, OID_TOTAL_IMPRESSIONS)),
                Long.parseLong(getSnmpValue(snmp, target, OID_BLACK_PRINTS)),
                isColor ? Long.parseLong(getSnmpValue(snmp, target, OID_COLOR_PRINTS)) : null
            ));
            
            // قراءة مستويات الحبر والدرام
            if (isColor) {
                printerData.setInkLevels(getColorInkLevels(snmp, target));
                printerData.setDrumLevels(getColorDrumLevels(snmp, target));
            } else {
                printerData.setInkLevels(getMonoInkLevels(snmp, target));
                printerData.setDrumLevels(getMonoDrumLevels(snmp, target));
            }
            
            return printerData;
            
        } finally {
            snmp.close();
        }
    }
    
    private String getSnmpValue(Snmp snmp, CommunityTarget target, String oid) throws Exception {
        PDU pdu = new PDU();
        pdu.add(new VariableBinding(new OID(oid)));
        pdu.setType(PDU.GET);
        
        ResponseEvent response = snmp.get(pdu, target);
        if (response != null && response.getResponse() != null) {
            return response.getResponse().get(0).getVariable().toString();
        }
        return "";
    }
    
    private boolean checkIfColorPrinter(Snmp snmp, CommunityTarget target) {
        try {
            String colorValue = getSnmpValue(snmp, target, OID_COLOR_PRINTS);
            return colorValue != null && !colorValue.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    private InkLevels getColorInkLevels(Snmp snmp, CommunityTarget target) throws Exception {
        return new InkLevels(
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.1"),  // أسود
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.2"),  // سماوي
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.3"),  // ماجنتا
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.4")   // أصفر
        );
    }
    
    private InkLevels getMonoInkLevels(Snmp snmp, CommunityTarget target) throws Exception {
        return new InkLevels(
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.1"),  // أسود
            null, null, null
        );
    }
    
    private DrumLevels getColorDrumLevels(Snmp snmp, CommunityTarget target) throws Exception {
        return new DrumLevels(
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.5"),  // درام أسود
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.6"),  // درام سماوي
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.7"),  // درام ماجنتا
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.8")   // درام أصفر
        );
    }
    
    private DrumLevels getMonoDrumLevels(Snmp snmp, CommunityTarget target) throws Exception {
        return new DrumLevels(
            getPercentage(snmp, target, "1.3.6.1.2.1.43.11.1.1.9.1.5"),  // درام أسود
            null, null, null
        );
    }
    
    private int getPercentage(Snmp snmp, CommunityTarget target, String oid) throws Exception {
        String value = getSnmpValue(snmp, target, oid);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}