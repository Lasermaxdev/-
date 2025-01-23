import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/printers")
@CrossOrigin(origins = "*")  // تفعيل CORS للتطوير
public class PrinterController {
    
    @Autowired
    private PrinterSNMPService printerService;
    
    @GetMapping("/detect")
    public ResponseEntity<?> detectPrinter(@RequestParam String ip) {
        try {
            SNMPPrinterData printerData = printerService.getPrinterData(ip);
            return ResponseEntity.ok(printerData);
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("فشل في الاتصال بالطابعة: " + e.getMessage()));
        }
    }
}