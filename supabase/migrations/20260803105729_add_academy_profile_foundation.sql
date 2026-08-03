alter table public.profiles
  add column preferred_locale text,
  add column country_code text,
  add column pricing_region text,
  add column certificate_name text;

alter table public.profiles
  add constraint profiles_preferred_locale_check
    check (preferred_locale is null or preferred_locale in ('en', 'id')),
  add constraint profiles_country_code_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  add constraint profiles_pricing_region_check
    check (pricing_region is null or pricing_region in ('ID', 'INTL')),
  add constraint profiles_country_pricing_region_check
    check (
      country_code is null
      or pricing_region is null
      or pricing_region = case when country_code = 'ID' then 'ID' else 'INTL' end
    ),
  add constraint profiles_certificate_name_check
    check (
      certificate_name is null
      or char_length(btrim(certificate_name)) between 1 and 120
    );

comment on column public.profiles.preferred_locale is
  'Academy UI locale preference. Supported Phase 0 values are en and id.';
comment on column public.profiles.country_code is
  'Optional ISO 3166-1 alpha-2 country code, independent from UI locale.';
comment on column public.profiles.pricing_region is
  'Commercial region foundation only: ID for Indonesia, INTL otherwise.';
comment on column public.profiles.certificate_name is
  'Optional future certificate name; applications fall back to display_name.';

grant update(preferred_locale, country_code, pricing_region, certificate_name)
  on public.profiles to authenticated;
