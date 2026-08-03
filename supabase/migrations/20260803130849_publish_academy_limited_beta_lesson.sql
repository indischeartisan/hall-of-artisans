update public.academy_courses set status='published', published_at=coalesce(published_at,now()), estimated_minutes=30, updated_at=now()
where id='a1000000-0000-4000-8000-000000000001';

update public.academy_course_translations set
  full_description=case locale when 'en' then 'A quiet, reading-led introduction to perceiving perfume with attention. This limited beta opens one complete guided lesson while the remaining curriculum stays in preparation.' else 'Pengantar tenang berbasis bacaan untuk mengamati parfum dengan penuh perhatian. Beta terbatas ini membuka satu lesson terpandu yang lengkap sementara curriculum lainnya tetap disiapkan.' end,
  learning_outcomes=case locale when 'en' then '["Observe a fragrance through opening, heart, and drydown","Build a repeatable smelling practice","Describe changes without relying on marketing language"]'::jsonb else '["Mengamati fragrance melalui opening, heart, dan drydown","Membangun latihan penciuman yang dapat diulang","Menjelaskan perubahan aroma tanpa bergantung pada bahasa pemasaran"]'::jsonb end,
  audience=case locale when 'en' then '["Beginners exploring perfumery","Curious fragrance wearers","Artisans developing sensory attention"]'::jsonb else '["Pemula yang menjelajahi perfumery","Pengguna fragrance yang ingin tahu","Artisan yang mengembangkan kepekaan indra"]'::jsonb end
where course_id='a1000000-0000-4000-8000-000000000001';

update public.academy_modules set status='published', estimated_minutes=30, updated_at=now()
where id='a2000000-0000-4000-8000-000000000001';
update public.academy_module_translations set
  description=case locale when 'en' then 'A first practice in attentive smelling.' else 'Latihan pertama untuk mencium dengan penuh perhatian.' end,
  learning_outcome=case locale when 'en' then 'Learn a calm, repeatable way to observe perfume over time.' else 'Pelajari cara yang tenang dan dapat diulang untuk mengamati parfum seiring waktu.' end
where module_id='a2000000-0000-4000-8000-000000000001';

update public.academy_lessons set status='published', lesson_type='mixed', reading_minutes=15, practice_minutes=15,
  is_preview=false, requires_previous_lesson=false, published_at=coalesce(published_at,now()), updated_at=now()
where id='a3000000-0000-4000-8000-000000000005';
update public.academy_lesson_translations set
  opening_line=case locale when 'en' then 'Smelling well begins with slowing down.' else 'Mencium dengan baik dimulai dengan memperlambat diri.' end,
  introduction=case locale when 'en' then 'Perfume does not reveal itself all at once. In this lesson, you will observe one fragrance at intervals and record how its shape changes from the first impression to the drydown.' else 'Parfum tidak mengungkapkan dirinya sekaligus. Dalam lesson ini, Anda akan mengamati satu fragrance secara berkala dan mencatat bagaimana bentuknya berubah dari kesan pertama hingga drydown.' end,
  learning_objectives=case locale when 'en' then '["Prepare a neutral smelling environment","Observe opening, heart, and drydown separately","Use specific sensory words without judging too quickly"]'::jsonb else '["Menyiapkan lingkungan penciuman yang netral","Mengamati opening, heart, dan drydown secara terpisah","Menggunakan kata sensorik yang spesifik tanpa menilai terlalu cepat"]'::jsonb end,
  materials_needed=case locale when 'en' then '["One perfume","A paper blotter or unscented card","A notebook and pencil","Thirty quiet minutes"]'::jsonb else '["Satu parfum","Blotter kertas atau kartu tanpa aroma","Buku catatan dan pensil","Tiga puluh menit yang tenang"]'::jsonb end
where lesson_id='a3000000-0000-4000-8000-000000000005';

insert into public.academy_lesson_blocks(id,lesson_id,block_type,position,status,settings) values
('a4000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000005','rich_text',1,'published','{}'),
('a4000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000005','rich_text',2,'published','{}'),
('a4000000-0000-4000-8000-000000000003','a3000000-0000-4000-8000-000000000005','diagram',3,'published','{}'),
('a4000000-0000-4000-8000-000000000004','a3000000-0000-4000-8000-000000000005','perfumer_note',4,'published','{}'),
('a4000000-0000-4000-8000-000000000005','a3000000-0000-4000-8000-000000000005','exercise',5,'published','{"estimated_minutes":15}'),
('a4000000-0000-4000-8000-000000000006','a3000000-0000-4000-8000-000000000005','summary',6,'published','{}'),
('a4000000-0000-4000-8000-000000000007','a3000000-0000-4000-8000-000000000005','divider',7,'published','{}')
on conflict (id) do update set block_type=excluded.block_type,position=excluded.position,status=excluded.status,settings=excluded.settings,updated_at=now();

insert into public.academy_lesson_block_translations(block_id,locale,content) values
('a4000000-0000-4000-8000-000000000001','en','{"sections":[{"type":"heading","level":2,"text":"Before You Spray"},{"type":"paragraph","runs":[{"text":"Choose a quiet room with moving air, but no candles, cooking aromas, or recently applied fragrance."}]},{"type":"bullet_list","items":["Rest your nose for a few minutes.","Write the perfume name and time.","Spray once on a blotter and avoid touching the wet area."]}]}'),
('a4000000-0000-4000-8000-000000000001','id','{"sections":[{"type":"heading","level":2,"text":"Sebelum Menyemprot"},{"type":"paragraph","runs":[{"text":"Pilih ruang tenang dengan udara bergerak, tanpa lilin, aroma masakan, atau fragrance yang baru digunakan."}]},{"type":"bullet_list","items":["Istirahatkan hidung selama beberapa menit.","Tuliskan nama parfum dan waktu.","Semprot satu kali pada blotter dan jangan menyentuh area yang basah."]}]}'),
('a4000000-0000-4000-8000-000000000002','en','{"sections":[{"type":"heading","level":2,"text":"Observe, Then Name"},{"type":"paragraph","runs":[{"text":"Take a short smell rather than a long inhale. Notice temperature, texture, distance, and movement before searching for a familiar note."}]},{"type":"numbered_list","items":["At once: capture the opening in three words.","After ten minutes: notice what becomes clearer or quieter.","After thirty minutes: describe what remains close to the blotter."]},{"type":"paragraph","runs":[{"text":"Description comes before preference.","emphasis":true},{"text":" You are training attention, not producing a verdict."}]}]}'),
('a4000000-0000-4000-8000-000000000002','id','{"sections":[{"type":"heading","level":2,"text":"Amati, Lalu Beri Nama"},{"type":"paragraph","runs":[{"text":"Cium sebentar alih-alih menarik napas panjang. Amati suhu, tekstur, jarak, dan gerakan sebelum mencari not yang familiar."}]},{"type":"numbered_list","items":["Saat pertama: tangkap opening dalam tiga kata.","Setelah sepuluh menit: amati apa yang menjadi lebih jelas atau lebih tenang.","Setelah tiga puluh menit: jelaskan apa yang tertinggal dekat blotter."]},{"type":"paragraph","runs":[{"text":"Deskripsi hadir sebelum preferensi.","emphasis":true},{"text":" Anda sedang melatih perhatian, bukan menghasilkan keputusan."}]}]}'),
('a4000000-0000-4000-8000-000000000003','en','{"title":"A Fragrance in Time","stages":[{"label":"Opening","time":"0–5 min","description":"Lift, brightness, first movement"},{"label":"Heart","time":"10–30 min","description":"Shape, theme, connection"},{"label":"Drydown","time":"30+ min","description":"Persistence, texture, intimacy"}]}'),
('a4000000-0000-4000-8000-000000000003','id','{"title":"Fragrance Seiring Waktu","stages":[{"label":"Opening","time":"0–5 menit","description":"Daya angkat, kecerahan, gerakan pertama"},{"label":"Heart","time":"10–30 menit","description":"Bentuk, tema, hubungan"},{"label":"Drydown","time":"30+ menit","description":"Ketahanan, tekstur, kedekatan"}]}'),
('a4000000-0000-4000-8000-000000000004','en','{"title":"Perfumer’s Note","note":"Do not force your nose to identify ingredients. A material can feel cool, sheer, dusty, rounded, or still. Those observations are already useful."}'),
('a4000000-0000-4000-8000-000000000004','id','{"title":"Catatan Perfumer","note":"Jangan memaksa hidung untuk mengenali bahan. Sebuah material dapat terasa sejuk, transparan, berdebu, membulat, atau diam. Pengamatan tersebut sudah berguna."}'),
('a4000000-0000-4000-8000-000000000005','en','{"title":"Guided Smelling Exercise","instructions":["Prepare the blotter and write the current time.","Smell at 0, 10, and 30 minutes.","At each interval, write three sensory words and one change you noticed.","Finish with one sentence describing the fragrance’s movement rather than whether you like it."]}'),
('a4000000-0000-4000-8000-000000000005','id','{"title":"Latihan Penciuman Terpandu","instructions":["Siapkan blotter dan tuliskan waktu saat ini.","Cium pada menit ke-0, 10, dan 30.","Pada setiap interval, tuliskan tiga kata sensorik dan satu perubahan yang Anda amati.","Akhiri dengan satu kalimat tentang gerakan fragrance, bukan apakah Anda menyukainya."]}'),
('a4000000-0000-4000-8000-000000000006','en','{"title":"What to Carry Forward","points":["Smell briefly and at intervals.","Observe qualities before guessing notes.","Separate description from preference.","Return to the same fragrance as it changes."]}'),
('a4000000-0000-4000-8000-000000000006','id','{"title":"Hal yang Perlu Dibawa","points":["Cium sebentar dan secara berkala.","Amati kualitas sebelum menebak not.","Pisahkan deskripsi dari preferensi.","Kembali ke fragrance yang sama saat ia berubah."]}'),
('a4000000-0000-4000-8000-000000000007','en','{}'),
('a4000000-0000-4000-8000-000000000007','id','{}')
on conflict (block_id,locale) do update set content=excluded.content,updated_at=now();
