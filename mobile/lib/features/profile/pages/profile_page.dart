import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_event.dart';
import '../../auth/bloc/auth_state.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          context.go('/login');
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Profil'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.paddingMD),
          child: Column(
            children: [
              const SizedBox(height: 16),
              // Avatar
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  String name = 'Pengguna';
                  String email = 'user@email.com';
                  if (state is AuthAuthenticated) {
                    name = state.user.name;
                    email = state.user.email;
                  }
                  return Column(
                    children: [
                      CircleAvatar(
                        radius: AppSizes.avatarLG / 2 + 16,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'U',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        name,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        email,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              const Divider(),

              // Menu Items
              _buildMenuItem(
                context,
                icon: Icons.person_outline,
                title: 'Edit Profil',
                onTap: () => context.push('/profile/edit'),
              ),
              _buildMenuItem(
                context,
                icon: Icons.description_outlined,
                title: 'Dokumen Saya',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Fitur dokumen akan segera hadir')),
                  );
                },
              ),
              _buildMenuItem(
                context,
                icon: Icons.receipt_long_outlined,
                title: 'Riwayat Booking',
                onTap: () => context.push('/my-bookings'),
              ),
              _buildMenuItem(
                context,
                icon: Icons.settings_outlined,
                title: 'Pengaturan',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Fitur pengaturan akan segera hadir')),
                  );
                },
              ),
              _buildMenuItem(
                context,
                icon: Icons.help_outline,
                title: 'Bantuan',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Hubungi kami di support@caritahub.com')),
                  );
                },
              ),
              _buildMenuItem(
                context,
                icon: Icons.info_outline,
                title: 'Tentang Caritahub Rental',
                onTap: () {
                  showAboutDialog(
                    context: context,
                    applicationName: 'Caritahub Rental',
                    applicationVersion: AppConstants.appVersion,
                    applicationIcon: const Icon(
                      Icons.directions_car,
                      size: 48,
                      color: AppColors.primary,
                    ),
                    children: [
                      const Text('Aplikasi sewa mobil terpercaya dan mudah digunakan.'),
                    ],
                  );
                },
              ),
              const Divider(),

              // Logout
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: const Text(
                  'Keluar',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w500),
                ),
                onTap: () => _showLogoutDialog(context),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: onTap,
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Keluar'),
        content: const Text('Apakah Anda yakin ingin keluar dari akun?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<AuthBloc>().add(LogoutRequested());
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Ya, Keluar'),
          ),
        ],
      ),
    );
  }
}
