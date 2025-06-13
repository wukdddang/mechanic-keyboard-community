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

    // Supabase Auth를 사용하여 사용자 등록
    const { data, error } = await this.supabaseService.signUp(email, password);

    if (error) {
      throw new BadRequestException(`회원가입 실패: ${error.message}`);
    }

    // 사용자 프로필 정보를 별도 테이블에 저장
    if (data.user) {
      const { data: profileData, error: profileError } =
        await this.supabaseService.insert('profiles', {
          id: data.user.id,
          username,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
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
}
