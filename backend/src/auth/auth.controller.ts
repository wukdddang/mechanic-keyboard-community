import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Request,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body() body: { email: string }) {
    return this.authService.resendEmailConfirmation(body.email);
  }

  @Get('me')
  async getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  @Patch('profile')
  async updateProfile(@Body() updateData: any, @Request() req: any) {
    // 실제 구현에서는 JWT에서 user ID를 추출해야 합니다
    const userId = req.user?.id;
    return this.authService.updateProfile(userId, updateData);
  }

  @Get('callback')
  async handleEmailVerification(@Res() res: Response) {
    console.log('이메일 인증 콜백 페이지 요청됨');

    // JavaScript로 URL fragment를 파싱하고 처리하는 HTML 페이지 반환
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>이메일 인증 처리중...</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success { color: #4CAF50; }
          .error { color: #f44336; }
          .info { color: #2196F3; }
          .loading { color: #FF9800; }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div id="loading" style="display: block;">
            <div class="spinner"></div>
            <h2 class="loading">이메일 인증을 처리하고 있습니다...</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
          
          <div id="success" style="display: none;">
            <h1 class="success">✅ 이메일 인증이 완료되었습니다!</h1>
            <p class="info">계정이 성공적으로 활성화되었습니다.</p>
            <p>이제 앱에서 로그인하실 수 있습니다.</p>
            <button onclick="window.close()" style="
              background-color: #4CAF50; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              margin-top: 20px;
            ">창 닫기</button>
          </div>
          
          <div id="error" style="display: none;">
            <h1 class="error">❌ 인증 처리 중 오류가 발생했습니다</h1>
            <p id="error-message">알 수 없는 오류가 발생했습니다.</p>
            <button onclick="window.location.reload()" style="
              background-color: #f44336; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              margin-top: 20px;
            ">다시 시도</button>
          </div>
        </div>

        <script>
          // URL fragment에서 토큰 파라미터 추출
          function getHashParams() {
            const hashParams = {};
            const hash = window.location.hash.substring(1);
            
            if (hash) {
              const params = hash.split('&');
              params.forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                  hashParams[decodeURIComponent(key)] = decodeURIComponent(value);
                }
              });
            }
            
            return hashParams;
          }

          // 백엔드에 인증 결과 전송
          async function processAuthentication() {
            try {
              const params = getHashParams();
              console.log('URL Fragment 파라미터:', params);

              if (params.access_token && params.type === 'signup') {
                // 백엔드에 인증 성공 알림
                const response = await fetch('/auth/verify-callback', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                    expires_at: params.expires_at,
                    expires_in: params.expires_in,
                    type: params.type
                  })
                });

                const result = await response.json();
                console.log('백엔드 응답:', result);

                // 성공 화면 표시
                document.getElementById('loading').style.display = 'none';
                document.getElementById('success').style.display = 'block';
                
              } else if (params.error) {
                throw new Error(params.error_description || params.error);
              } else {
                throw new Error('유효하지 않은 인증 파라미터입니다.');
              }
              
            } catch (error) {
              console.error('인증 처리 오류:', error);
              
              // 오류 화면 표시
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'block';
              document.getElementById('error-message').textContent = error.message;
            }
          }

          // 페이지 로드 시 인증 처리 시작
          window.addEventListener('load', processAuthentication);
        </script>
      </body>
      </html>
    `;

    res.send(htmlResponse);
  }

  @Post('verify-callback')
  async verifyCallback(
    @Body()
    callbackData: {
      access_token: string;
      refresh_token: string;
      expires_at: string;
      expires_in: string;
      type: string;
    },
  ) {
    console.log('이메일 인증 콜백 데이터 수신:', {
      access_token: callbackData.access_token ? '***' : 'null',
      refresh_token: callbackData.refresh_token ? '***' : 'null',
      type: callbackData.type,
      expires_at: callbackData.expires_at,
    });

    try {
      // 토큰을 사용하여 사용자 정보 확인
      const response = await this.authService.verifyAuthCallback(
        callbackData.access_token,
      );
      return {
        success: true,
        message: '이메일 인증이 완료되었습니다.',
        data: response,
      };
    } catch (error) {
      console.error('콜백 검증 실패:', error);
      return {
        success: false,
        message: '인증 검증에 실패했습니다.',
        error: error.message,
      };
    }
  }
}
