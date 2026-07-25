with default_package as (
  select * from public.commission_packages where slug = 'essential-commission' limit 1
)
update public.review_requests request
set selected_package_id = package.id,
    package_snapshot = jsonb_build_object(
      'id', package.id, 'slug', package.slug, 'name', package.name,
      'description', 'Legacy project package assigned during workflow upgrade.',
      'price', coalesce(request.final_price, package.price), 'currency', request.currency,
      'concentration', request.concentration, 'bottleSize', request.bottle_size,
      'includedItems', case when cardinality(request.included_items) > 0 then request.included_items else package.included_items end,
      'consultationsIncluded', coalesce(request.revisions_included, package.consultations_included),
      'estimatedProduction', coalesce(request.estimated_production, package.estimated_production),
      'displayOrder', package.display_order
    ),
    final_price = coalesce(request.final_price, package.price),
    included_items = case when cardinality(request.included_items) > 0 then request.included_items else package.included_items end,
    estimated_production = coalesce(request.estimated_production, package.estimated_production)
from default_package package
where request.status <> 'DRAFT_PREVIEW'
  and request.selected_package_id is null;

