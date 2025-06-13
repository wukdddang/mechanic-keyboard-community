import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: any; session: any }> {
    const { username, email, password } = createUserDto;

    console.log('회원가입 시도:', { username, email, password: '****' });

    // Supabase Auth를 사용하여 사용자 등록 (username을 metadata에 포함)
    const { data, error } = await this.supabaseService.signUp(email, password, {
      username,
    });

    if (error) {
      console.error('Supabase 회원가입 에러:', {
        message: error.message,
        status: error.status,
        error: JSON.stringify(error, null, 2),
      });
      throw new BadRequestException(`회원가입 실패: ${error.message}`);
    }

    console.log('회원가입 성공:', data.user?.email);
    console.log('프로필은 Database 트리거를 통해 자동 생성됩니다.');

    // 이메일 확인 상태 로깅
    if (data.user) {
      console.log('사용자 상세 정보:', {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        confirmation_sent_at: data.user.confirmation_sent_at,
        created_at: data.user.created_at,
      });

      if (!data.user.email_confirmed_at) {
        console.log(
          '⚠️  이메일 확인이 필요합니다. 확인 이메일을 확인해주세요.',
        );
        console.log(
          '이메일이 오지 않았다면 /auth/resend-confirmation API를 사용하세요.',
        );
      }
    }

    return { user: data.user, session: data.session };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: any; session: any }> {
    const { data, error } = await this.supabaseService.signIn(email, password);

    if (error) {
      throw new UnauthorizedException(`로그인 실패: ${error.message}`);
    }

    return { user: data.user, session: data.session };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabaseService.signOut();

    if (error) {
      throw new BadRequestException(`로그아웃 실패: ${error.message}`);
    }
  }

  async getCurrentUser(): Promise<any> {
    const user = await this.supabaseService.getCurrentUser();

    if (!user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    // 사용자 프로필 정보 가져오기
    const { data: profileData } = await this.supabaseService.select(
      'profiles',
      '*',
      { id: user.id },
    );

    return {
      ...user,
      profile: profileData?.[0] || null,
    };
  }

  async validateUser(userId: string): Promise<any> {
    try {
      const { data } = await this.supabaseService.select('profiles', '*', {
        id: userId,
      });
      return data?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(userId: string, updateData: any): Promise<any> {
    const { data, error } = await this.supabaseService.update(
      'profiles',
      userId,
      {
        ...updateData,
        updated_at: new Date().toISOString(),
      },
    );

    if (error) {
      throw new BadRequestException(`프로필 업데이트 실패: ${error.message}`);
    }

    return data?.[0];
  }

  async resendEmailConfirmation(email: string): Promise<any> {
    const { data, error } =
      await this.supabaseService.resendConfirmation(email);

    if (error) {
      throw new BadRequestException(`이메일 재발송 실패: ${error.message}`);
    }

    return { message: '확인 이메일이 재발송되었습니다.' };
  }

  async verifyAuthCallback(accessToken: string): Promise<any> {
    try {
      // 토큰으로 사용자 정보 가져오기
      const userInfo = await this.supabaseService.getUserFromToken(accessToken);

      if (!userInfo) {
        throw new BadRequestException('유효하지 않은 토큰입니다.');
      }

      console.log('✅ 이메일 인증 완료된 사용자:', {
        id: userInfo.id,
        email: userInfo.email,
        email_confirmed_at: userInfo.email_confirmed_at,
      });

      // 프로필 존재 여부 확인
      const { data: profileData } = await this.supabaseService.select(
        'profiles',
        '*',
        { id: userInfo.id },
      );

      if (!profileData || profileData.length === 0) {
        console.log('프로필이 없습니다. Database 트리거를 확인해주세요.');
      } else {
        console.log('✅ 사용자 프로필 확인됨:', profileData[0]);
      }

      return {
        user: userInfo,
        profile: profileData?.[0] || null,
        message: '이메일 인증이 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      throw new BadRequestException(`토큰 검증 실패: ${error.message}`);
    }
  }
}
