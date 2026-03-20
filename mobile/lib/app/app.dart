import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'routes.dart';
import 'theme.dart';
import '../core/api/api_client.dart';
import '../features/auth/bloc/auth_bloc.dart';

class RentalApp extends StatelessWidget {
  const RentalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => AuthBloc(apiClient: ApiClient())..add(CheckAuthStatus()),
        ),
      ],
      child: MaterialApp.router(
        title: 'CaritaHub Rental',
        theme: AppTheme.lightTheme,
        routerConfig: appRouter,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
