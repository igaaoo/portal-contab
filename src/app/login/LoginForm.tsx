'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, ArrowRight, Building2, Check, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';

type LoginFormValues = {
  provider: string;
  login: string;
  password: string;
  remember: boolean;
};

export default function LoginForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      provider: 'PROCARE',
      login: '',
      password: '',
      remember: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push('/dashboard');
        return;
      }

      const data = await res.json();

      setError('root', {
        type: 'server',
        message: data.error || 'Credenciais inválidas',
      });
    } catch {
      setError('root', {
        type: 'server',
        message: 'Erro de conexão',
      });
    }
  }

  const errorMessage =
    errors.root?.message ||
    errors.login?.message ||
    errors.password?.message;

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left — form */}
      {/* Left — form */}
      <div className="w-full md:w-[46%] min-h-screen bg-[#f8f6f1] flex items-center justify-center px-8">
        <div className="w-full max-w-[400px]">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              PC
            </div>

            <div>
              <div className="font-bold text-black text-lg leading-none">
                Portal Contab
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Gestão contábil
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black">
              Acessar plataforma
            </h1>

            <p className="text-sm text-zinc-600 mt-3">
              Use suas credenciais para entrar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Provedor *">
              <Controller
                name="provider"
                control={control}
                rules={{
                  required: 'Informe o provedor',
                }}
                render={({ field }) => (
                  <div>
                    <div className="relative">
                      <Globe2
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />

                      <Input
                        type="text"
                        placeholder="PROCARE"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        onBlur={field.onBlur}
                        className="h-9 pl-10 rounded-lg border-[#ded8cc] bg-white text-sm font-mono tracking-widest uppercase"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 mt-2">
                      Chave da sua empresa. Ex.: PROCARE, NEWLAND.
                    </p>
                  </div>
                )}
              />
            </Field>

            <Field label="Login *">
              <Controller
                name="login"
                control={control}
                rules={{
                  required: 'Informe o login',
                }}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="beatriz.lemos"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="h-9 rounded-lg border-[#ded8cc] bg-white text-sm"
                  />
                )}
              />
            </Field>

            <Field label="Senha *">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Informe a senha',
                }}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-9 pr-10 rounded-lg border-[#ded8cc] bg-white text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 cursor-pointer"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}
              />
            </Field>

            <div className="flex items-center justify-between -mt-1">
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="sr-only"
                    />

                    <span
                      className={[
                        'w-4 h-4 rounded flex items-center justify-center border',
                        field.value
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'bg-white border-[#ded8cc]',
                      ].join(' ')}
                    >
                      {field.value && <Check size={12} strokeWidth={3} />}
                    </span>

                    Lembrar acesso neste dispositivo
                  </label>
                )}
              />

              <button
                type="button"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Esqueci minha senha
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  !
                </span>
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              iconRight={!isSubmitting ? <ArrowRight size={14} /> : undefined}
              className="mt-2 w-full h-10 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold"
            >
              Entrar
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative overflow-hidden bg-[#eef2ed]">
        {/* Grid de fundo */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15, 118, 110, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 118, 110, 0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        {/* Gradientes suaves */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/70 via-transparent to-teal-200/40" />
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        {/* Conteúdo */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-16 py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 shadow-sm backdrop-blur">
              <span className="text-sm">✣</span>
              Plataforma SaaS · Contábil
            </div>

            <h2 className="mt-8 text-2xl font-semibold leading-tight text-black">
              Gestão contábil{' '}
              <span className="text-teal-700">multiempresa</span>
              <br />
              do extrato bancário ao lançamento auditado.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-6 text-zinc-600">
              Centralize todos os CNPJs do grupo em um único lugar. Conciliação
              automatizada, classificação contábil consistente e visão executiva sobre
              os lançamentos
            </p>
          </div>

          <div className="grid grid-cols-3 gap-10">
            {[
              {
                title: 'Múltiplos CNPJs',
                description: 'visão por empresa e consolidada',
              },
              {
                title: 'Auditável',
                description: 'rastreabilidade de cada lançamento',
              },
              {
                title: 'Escalável',
                description: 'novos módulos sob demanda',
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-sm font-bold text-black">
                  {item.title}
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}