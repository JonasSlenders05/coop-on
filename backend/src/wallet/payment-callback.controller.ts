import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payment')
export class PaymentCallbackController {
  @Public()
  @Get('success')
  handleSuccess() {
    return `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: green;">Betaling Geslaagd! ✅</h1>
          <p>Je wallet is opgewaardeerd. Je kunt dit venster sluiten.</p>
        </body>
      </html>
    `;
  }

  @Public()
  @Get('cancel')
  handleCancel() {
    return `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: red;">Betaling Geannuleerd ❌</h1>
          <p>Er is niets afgeschreven.</p>
        </body>
      </html>
    `;
  }
}
