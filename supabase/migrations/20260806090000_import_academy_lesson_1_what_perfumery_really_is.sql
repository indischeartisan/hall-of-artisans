begin;

do $academy_import$
declare
  target_course_id uuid;
  target_module_id uuid;
  target_lesson_id uuid;
  target_block_id uuid;
begin
  select id into target_course_id from public.academy_courses where slug = 'introduction-to-the-world-of-perfumery';
  if target_course_id is null then raise exception 'Academy course not found: %', 'introduction-to-the-world-of-perfumery'; end if;

  select id into target_module_id from public.academy_modules where course_id = target_course_id and position = 1;
  if target_module_id is null then raise exception 'Academy module position % not found', 1; end if;

  select id into target_lesson_id from public.academy_lessons where slug = 'what-perfumery-really-is';
  if target_lesson_id is null then
    target_lesson_id := 'a3000000-0000-4000-8000-000000000001'::uuid;
    insert into public.academy_lessons (id, module_id, slug, position, status, lesson_type, reading_minutes, practice_minutes, is_preview, requires_previous_lesson)
    values (target_lesson_id, target_module_id, 'what-perfumery-really-is', 1, 'draft', 'reading', 25, 15, false, false);
  else
    update public.academy_lessons set module_id = target_module_id, position = 1, status = 'draft', lesson_type = 'reading', reading_minutes = 25, practice_minutes = 15, is_preview = false, requires_previous_lesson = false, published_at = null, updated_at = now() where id = target_lesson_id;
  end if;

  insert into public.academy_lesson_translations (lesson_id, locale, title, opening_line, introduction, learning_objectives, materials_needed) values
    (target_lesson_id, 'en', 'What Perfumery Really Is', 'A formula is not yet a perfume.', 'Perfumery is the practice of shaping an idea into an olfactory experience through materials, structure, evaluation, and deliberate decisions.', $academy_json$["Understand perfumery as both a creative and technical practice.","Distinguish between a fragrance idea, formula, fragrance concentrate, and finished product.","Understand that materials are selected for their function, not only for their smell.","See natural and synthetic materials as parts of the same creative palette.","Understand why evaluation and modification are essential to fragrance creation.","Begin observing perfume through character and construction rather than only through note lists."]$academy_json$::jsonb, $academy_json$["One perfume you already own","A blotter or unscented piece of paper","A notebook or notes application","A timer"]$academy_json$::jsonb),
    (target_lesson_id, 'id', 'Apa Sebenarnya Perfumery Itu?', 'Sebuah formula belum tentu menjadi parfum.', 'Perfumery adalah praktik membentuk sebuah gagasan menjadi pengalaman aroma melalui material, struktur, evaluasi, dan keputusan yang disengaja.', $academy_json$["Memahami perfumery sebagai praktik kreatif sekaligus teknis.","Membedakan ide parfum, formula, fragrance concentrate, dan produk akhir.","Memahami bahwa material dipilih berdasarkan fungsi, bukan hanya aromanya.","Melihat material natural dan synthetic sebagai bagian dari palet kreatif yang sama.","Memahami mengapa evaluasi dan modifikasi penting dalam penciptaan fragrance.","Mulai mengamati parfum melalui karakter dan konstruksinya, bukan hanya note list."]$academy_json$::jsonb, $academy_json$["Satu parfum yang sudah dimiliki","Blotter atau kertas yang tidak beraroma","Buku catatan atau aplikasi catatan","Timer"]$academy_json$::jsonb)
  on conflict (lesson_id, locale) do update set title = excluded.title, opening_line = excluded.opening_line, introduction = excluded.introduction, learning_objectives = excluded.learning_objectives, materials_needed = excluded.materials_needed, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 1;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000001'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 1, 'draft', $academy_json${"variant":"opening"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"opening"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"A Formula Is Not Yet a Perfume","paragraphs":["On a perfumer’s table, there may be several small bottles, a scale, a collection of blotters, a notebook, and two formulas that appear almost identical.","The difference between them may be very small. One material has been reduced. Another has been increased by a fraction. Yet when smelled, the results can feel noticeably different. One may seem heavier, while the other has more space. One may feel sweet and dense; the other, drier and more precise.","A perfumer’s work does not begin when the first material is weighed. It does not end when every ingredient has been mixed.","Before a formula is written, an idea must be translated. After the formula has been prepared, there is still smelling, waiting, comparing, recording, and revising.","Perfumery is therefore not simply the act of combining pleasant-smelling materials. It is the practice of shaping an idea into an olfactory experience through materials, structure, evaluation, and deliberate decisions."]}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"Sebuah Formula Belum Tentu Menjadi Parfum","paragraphs":["Di atas meja seorang perfumer terdapat beberapa botol kecil, timbangan, blotter, buku catatan, dan dua formula yang terlihat hampir sama.","Perbedaan antara keduanya mungkin sangat kecil. Satu material dikurangi. Material lain dinaikkan dalam jumlah yang sangat sedikit. Namun ketika dicium, hasilnya dapat terasa berbeda. Salah satunya lebih berat, sementara yang lain memiliki lebih banyak ruang. Salah satunya terasa manis dan padat; yang lain lebih kering dan jelas.","Pekerjaan seorang perfumer tidak dimulai ketika bahan pertama ditimbang. Pekerjaan itu juga tidak selesai ketika seluruh bahan telah tercampur.","Sebelum formula dibuat, ada sebuah gagasan yang harus diterjemahkan. Setelah formula dibuat, masih ada proses mencium, menunggu, membandingkan, mencatat, dan memperbaiki.","Karena itu, perfumery bukan sekadar kegiatan mencampurkan bahan yang harum. Perfumery adalah praktik membentuk sebuah gagasan menjadi pengalaman aroma melalui material, struktur, evaluasi, dan keputusan."]}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 2;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000002'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 2, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"1. Perfumery Begins with Intention","paragraphs":["A perfume may begin with something very simple. A perfumer might receive a brief for a fresh citrus cologne, a soft vanilla skin scent, or a quiet woody fragrance.","But a fragrance may also begin with something that has no obvious smell: an empty room before nightfall, laughter spreading beyond control, a garden after rain, someone who does not wish to be seen, or a creature that feeds on the scent of sleeping people.","Within Indische Artisan and Indische World, a fragrance does not always begin with the question, “Which notes are currently popular?” It may begin with a character, a place, an event, or the trace left behind after something has happened.","Yet an interesting story is not a perfume. The story must still be translated into olfactory decisions.","The perfumer must decide whether the idea feels bright or dark, cool or warm, weightless or heavy, transparent or dense. They must consider whether it should remain close to the skin or expand into the surrounding space, and whether it should feel familiar, strange, comforting, restrained, or slightly unsettling.","Creativity in perfumery is therefore not only the ability to imagine an evocative story. It is also the ability to make precise choices that allow the story to be smelled."],"misconception":{"claim":"A strong concept automatically creates a strong perfume.","correction":"A compelling concept can make a fragrance memorable, but it cannot replace structure. Even the most original idea still requires appropriate materials, balance, development, and disciplined evaluation."}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"1. Perfumery Dimulai dari Sebuah Maksud","paragraphs":["Sebuah parfum dapat bermula dari sesuatu yang sangat sederhana. Seorang perfumer mungkin menerima brief untuk membuat citrus cologne yang segar, vanilla skin scent yang lembut, atau woody fragrance yang tenang.","Namun sebuah fragrance juga dapat dimulai dari sesuatu yang tidak memiliki aroma yang jelas: kamar kosong menjelang malam, tawa yang menyebar tanpa kendali, kebun setelah hujan, seseorang yang tidak ingin terlihat, atau makhluk yang hidup dari aroma orang tertidur.","Di dalam Indische Artisan dan Indische World, sebuah parfum tidak selalu dimulai dari pertanyaan, “Notes apa yang sedang populer?” Ia dapat dimulai dari karakter, tempat, peristiwa, atau jejak yang tertinggal setelah sesuatu terjadi.","Namun cerita yang menarik belum menjadi parfum. Cerita tersebut masih harus diterjemahkan menjadi keputusan olfaktori.","Perfumer perlu menentukan apakah gagasan itu terasa terang atau gelap, dingin atau hangat, ringan atau berat, transparan atau padat. Ia perlu memikirkan apakah parfum terasa dekat dengan kulit atau menyebar memenuhi ruang, dan apakah aromanya familiar, asing, menenangkan, tertahan, atau sedikit mengganggu.","Karena itu, kreativitas dalam perfumery bukan hanya kemampuan menemukan cerita yang menarik. Kreativitas juga merupakan kemampuan membuat keputusan tepat agar cerita tersebut dapat dicium."],"misconception":{"claim":"Jika konsepnya kuat, parfumnya pasti kuat.","correction":"Konsep yang kuat dapat membuat parfum mudah diingat, tetapi tidak dapat menggantikan struktur. Gagasan yang menarik tetap membutuhkan material yang tepat, keseimbangan, perkembangan, dan evaluasi yang disiplin."}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 3;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000003'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'diagram', 3, 'draft', $academy_json${"layout":"process","mobileLayout":"stacked"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'diagram', status = 'draft', settings = $academy_json${"layout":"process","mobileLayout":"stacked"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"From Idea to Fragrance","steps":["Idea","Olfactory direction","Material selection","Formula structure","Evaluation","Modification","Finished fragrance"]}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Dari Gagasan Menuju Parfum","steps":["Gagasan","Arah olfaktori","Pemilihan material","Struktur formula","Evaluasi","Modifikasi","Finished fragrance"]}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 4;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000004'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 4, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"2. The Perfumer’s Palette","paragraphs":["A painter works with colour. A perfumer works with fragrance materials.","A perfumer’s palette may contain essential oils, absolutes, extracts, isolates, synthetic aroma molecules, bases, and accords prepared for particular functions.","Inside a formula, every material has more than a smell. It also has strength, rate of development, texture, diffusion, persistence, character, and relationships with other materials.","A citrus oil may smell sparkling, juicy, bitter, bright, or peel-like. Its role is not limited to making a perfume smell like citrus. It may open a composition, create energy, or provide contrast against darker materials.","Woody materials may feel dry, warm, clean, rough, smooth, or spacious. Musk materials may create impressions of cleanliness, softness, warmth, airiness, skin, volume, or persistence.","A perfumer therefore asks not only whether a material smells good, but what it does inside the formula."],"misconception":{"claim":"Natural materials are real, while synthetic materials are fake.","correction":"Both are real materials. Their differences relate to origin, method of production, composition, character, consistency, function, and use. Modern perfumery uses both."}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"2. Palet Seorang Perfumer","paragraphs":["Seorang pelukis bekerja dengan warna. Seorang perfumer bekerja dengan fragrance materials.","Palet seorang perfumer dapat berisi essential oils, absolutes, extracts, isolates, synthetic aroma molecules, bases, serta accords yang dipersiapkan untuk fungsi tertentu.","Di dalam formula, setiap material memiliki lebih dari sekadar bau. Ia juga memiliki kekuatan, kecepatan perkembangan, tekstur, diffusion, persistence, karakter, serta hubungan dengan material lain.","Citrus oil dapat memberi kesan sparkling, juicy, bitter, bright, atau peel-like. Perannya tidak terbatas pada membuat parfum berbau citrus. Ia dapat membuka komposisi, memberi energi, atau menciptakan kontras terhadap bagian yang lebih gelap.","Woody materials dapat terasa kering, hangat, bersih, kasar, lembut, atau luas. Musk materials dapat memberi kesan bersih, lembut, hangat, airy, skin-like, bervolume, atau tahan lama.","Karena itu, perfumer tidak hanya bertanya apakah suatu material baunya enak, tetapi juga apa yang dilakukan material tersebut di dalam formula."],"misconception":{"claim":"Material natural adalah asli, sedangkan material synthetic adalah palsu.","correction":"Keduanya merupakan material nyata. Perbedaannya berkaitan dengan asal, proses produksi, komposisi, karakter, konsistensi, fungsi, dan penggunaan. Perfumery modern menggunakan keduanya."}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 5;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000005'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'perfumer_note', 5, 'draft', $academy_json${"emphasis":"medium"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'perfumer_note', status = 'draft', settings = $academy_json${"emphasis":"medium"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Materials Have Roles","body":"When smelling a material, do not ask only, “What does it smell like?” Begin asking, “What might this material do when placed beside other materials?” The second question brings you closer to the way a perfumer thinks."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Material Memiliki Tugas","body":"Saat mencium sebuah material, jangan hanya bertanya, “Baunya seperti apa?” Mulailah bertanya, “Apa yang mungkin dilakukan material ini ketika ditempatkan bersama material lain?” Pertanyaan kedua akan membawamu lebih dekat pada cara seorang perfumer berpikir."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 6;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000006'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 6, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"3. A Formula Is a System of Relationships","paragraphs":["Several materials may smell interesting on their own and still produce an unbalanced perfume when combined.","A formula is not merely a collection of ingredients. It is a system of relationships.","When one material is added, it does not only introduce its own smell. It may make another part brighter, reduce sweetness, cover a delicate detail, increase diffusion, add weight, create dryness, slow development, or make the whole formula feel simpler.","Vanilla may feel creamy beside lactonic effects, dry beside woods, smoky through phenolic facets, airy with musks, boozy beside rum-like effects, or fruity with plum and dried-fruit nuances.","The theme may still be vanilla, but the structure determines how that theme is actually experienced."],"subheading":"An Indische Artisan Example: Iron Banana","exampleParagraphs":["The name Iron Banana contains two apparently clear ideas: banana and iron. Yet the name does not determine the final perfume.","The perfumer must decide whether the banana is ripe, green, creamy, candy-like, or artificial; whether the iron is cold, mineral, metallic, industrial, or blood-like; whether the two ideas blend or remain in conflict; and what survives into the drydown.","These decisions matter more than simply ensuring that banana and metal can both be smelled."],"misconception":{"claim":"The more materials a formula contains, the more complex it becomes.","correction":"Useful complexity comes from relationships, not quantity alone. A concise formula may feel rich and evolving, while a crowded formula may remain directionless."}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"3. Formula Adalah Hubungan Antarbagian","paragraphs":["Beberapa material dapat terasa menarik ketika dicium sendiri, tetapi tetap menghasilkan parfum yang tidak seimbang ketika digabungkan.","Formula bukan sekadar kumpulan bahan. Formula adalah sistem hubungan.","Ketika satu material ditambahkan, ia tidak hanya membawa baunya sendiri. Ia dapat membuat bagian lain lebih terang, mengurangi sweetness, menutup detail halus, meningkatkan diffusion, menambah berat, menciptakan kekeringan, memperlambat perkembangan, atau membuat formula terasa lebih sederhana.","Vanilla dapat terasa creamy bersama lactonic effects, lebih kering bersama woods, smoky melalui phenolic facets, airy dengan musks, boozy bersama rum-like effects, atau fruity bersama plum dan dried-fruit nuances.","Temanya mungkin tetap vanilla, tetapi struktur menentukan bagaimana tema tersebut benar-benar dialami."],"subheading":"Contoh dari Indische Artisan: Iron Banana","exampleParagraphs":["Nama Iron Banana mengandung dua gagasan yang tampak jelas: banana dan iron. Namun nama tersebut belum menentukan parfum akhirnya.","Perfumer masih harus menentukan apakah banana terasa matang, hijau, creamy, candy-like, atau artificial; apakah iron terasa dingin, mineral, metallic, industrial, atau seperti darah; apakah keduanya menyatu atau tetap bertabrakan; serta apa yang bertahan hingga drydown.","Keputusan-keputusan tersebut lebih penting daripada sekadar memastikan banana dan metal dapat tercium."],"misconception":{"claim":"Semakin banyak material, semakin kompleks parfumnya.","correction":"Kompleksitas yang berguna datang dari hubungan, bukan sekadar jumlah. Formula ringkas dapat terasa kaya dan berkembang, sementara formula yang penuh dapat tetap kehilangan arah."}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 7;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000007'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'diagram', 7, 'draft', $academy_json${"layout":"radial"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'diagram', status = 'draft', settings = $academy_json${"layout":"radial"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"A Material Can Affect More Than Smell","center":"Material","nodes":["Texture","Diffusion","Contrast","Development","Persistence","Balance"]}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Material Memengaruhi Lebih dari Sekadar Bau","center":"Material","nodes":["Tekstur","Diffusion","Kontras","Perkembangan","Persistence","Keseimbangan"]}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 8;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000008'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 8, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"4. Creation Happens Through Modification","paragraphs":["In popular imagination, a gifted perfumer may appear to discover the final formula in a single attempt. In practice, creation often develops through modification.","One version may reduce sweetness. Another may increase diffusion. A later modification may clean the opening, soften harshness, give more space to the heart, or extend the drydown.","Each modification asks a question: What happens if this part is reduced? Is the central idea still clear after three hours? Does the most interesting part disappear when the formula becomes smoother?","Waiting is essential. A formula may feel sharp during the first few minutes and become balanced later. Another may have a compelling opening but lose direction after an hour.","A perfumer smells at several stages, compares modifications, and records observations consistently. Notes reduce dependence on memory and help reveal patterns."],"misconception":{"claim":"Modification means that the previous formula failed.","correction":"Modification is a way of understanding a formula. Even a version that is never selected can reveal boundaries, possibilities, and directions."}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"4. Penciptaan Terjadi Melalui Modifikasi","paragraphs":["Dalam imajinasi populer, perfumer berbakat mungkin terlihat menemukan formula final dalam satu kali percobaan. Dalam praktiknya, penciptaan sering berlangsung melalui modifikasi.","Satu versi dapat mengurangi sweetness. Versi lain meningkatkan diffusion. Modifikasi berikutnya mungkin membersihkan opening, mengurangi harshness, memberi ruang pada heart, atau memperpanjang drydown.","Setiap modifikasi adalah sebuah pertanyaan: Apa yang terjadi jika bagian ini dikurangi? Apakah gagasan utama masih jelas setelah tiga jam? Apakah bagian paling menarik justru hilang ketika formula dibuat lebih halus?","Menunggu adalah bagian penting. Formula dapat terasa tajam pada menit pertama lalu menjadi seimbang kemudian. Formula lain mungkin memiliki opening menarik, tetapi kehilangan arah setelah satu jam.","Perfumer mencium pada beberapa tahap, membandingkan modifikasi, dan mencatat pengamatan secara konsisten. Catatan mengurangi ketergantungan pada ingatan dan membantu memperlihatkan pola."],"misconception":{"claim":"Modifikasi berarti formula sebelumnya gagal.","correction":"Modifikasi adalah cara memahami formula. Bahkan versi yang tidak dipilih dapat memperlihatkan batas, kemungkinan, dan arah."}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 9;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000009'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'diagram', 9, 'draft', $academy_json${"layout":"cycle"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'diagram', status = 'draft', settings = $academy_json${"layout":"cycle"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"The Evaluation Loop","steps":["Compose","Smell","Wait","Compare","Record","Modify","Smell again"]}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Siklus Evaluasi","steps":["Compose","Smell","Wait","Compare","Record","Modify","Smell again"]}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 10;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000010'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'perfumer_note', 10, 'draft', $academy_json${"emphasis":"high"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'perfumer_note', status = 'draft', settings = $academy_json${"emphasis":"high"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Do Not Judge Too Quickly","body":"The opening is often the easiest part to notice, but it is not always the most important. Give the formula time to reveal its structure. Some problems only become visible after the most volatile materials begin to fade."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Jangan Menilai Terlalu Cepat","body":"Opening sering menjadi bagian yang paling mudah menarik perhatian, tetapi bukan selalu bagian yang paling penting. Berikan formula waktu untuk memperlihatkan strukturnya. Beberapa masalah baru muncul setelah material yang lebih cepat menguap mulai berkurang."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 11;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000011'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 11, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"5. A Perfume Must Work in the Real World","paragraphs":["A formula that smells interesting on a blotter is not automatically ready to become a product.","The perfumer must consider whether the fragrance will become an eau de parfum, perfume oil, soap, candle, room spray, shampoo, or another product. The medium and product category affect how the fragrance behaves and how its use is evaluated.","Concentration also matters. A formula that feels balanced at one concentration may become sharp, flat, heavy, or unclear at another.","Beyond smell, there are considerations such as stability, colour change, interaction with the product base, storage, heat, light, packaging, safety, and regulation.","Some fragrance materials may be restricted, prohibited, or subject to purity requirements according to safety assessment and finished-product category.","Safety is not something added after creativity is complete. It is one of the real boundaries within which creativity operates."],"misconception":{"claim":"If a material is permitted, it can be used in any amount.","correction":"Some materials have restrictions, purity requirements, or prohibitions based on safety assessment and product category. Different products create different forms and levels of exposure."}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"5. Sebuah Parfum Harus Bekerja di Dunia Nyata","paragraphs":["Formula yang menarik pada blotter belum tentu siap menjadi produk.","Perfumer harus mempertimbangkan apakah fragrance tersebut akan menjadi eau de parfum, perfume oil, sabun, lilin, room spray, shampoo, atau produk lain. Medium dan kategori produk memengaruhi perilaku fragrance dan cara penggunaannya dinilai.","Konsentrasi juga berpengaruh. Formula yang seimbang pada satu konsentrasi dapat menjadi tajam, datar, berat, atau tidak jelas pada konsentrasi lain.","Selain aroma, terdapat pertimbangan seperti stabilitas, perubahan warna, interaksi dengan medium, penyimpanan, panas, cahaya, packaging, keselamatan, dan regulasi.","Beberapa fragrance materials dapat dibatasi, dilarang, atau memiliki persyaratan kemurnian berdasarkan penilaian keselamatan dan kategori produk akhir.","Keselamatan bukan bagian yang ditempelkan setelah kreativitas selesai. Keselamatan adalah salah satu batas nyata tempat kreativitas bekerja."],"misconception":{"claim":"Jika suatu material diperbolehkan, berarti dapat digunakan dalam jumlah berapa pun.","correction":"Beberapa material memiliki pembatasan, persyaratan kemurnian, atau larangan berdasarkan penilaian keselamatan dan kategori produk. Produk berbeda menghasilkan bentuk dan tingkat paparan yang berbeda."}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 12;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000012'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 12, 'draft', $academy_json${"variant":"section"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"section"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"6. Who Creates a Perfume?","paragraphs":["A fragrance is often associated with the name of a perfumer. In professional practice, however, the finished product may involve several roles."],"items":[{"title":"The Perfumer","body":"Develops the formula and olfactory direction, selects materials, structures their relationships, evaluates the result, and creates modifications."},{"title":"The Evaluator or Creative Fragrance Developer","body":"Helps interpret the brief, assess modifications, and determine whether the result remains aligned with the intended product or brand."},{"title":"The Laboratory Team","body":"Weighs formulas accurately, prepares modifications, and ensures that samples are produced consistently."},{"title":"The Regulatory and Safety Team","body":"Reviews material restrictions, documentation, application categories, safety requirements, and regulatory obligations."},{"title":"The Brand or Creative Director","body":"Defines the world, audience, positioning, story, character, and final product direction."},{"title":"The Manufacturer","body":"Turns the fragrance concentrate into a finished product through production, filling, consistency control, quality control, and packaging."}],"closing":"Within an artisan brand such as Indische Artisan, several of these functions may be performed by the same person or a small team. The functions still exist: creation, evaluation, weighing, production, checking, and decision-making."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"6. Siapa yang Menciptakan Sebuah Parfum?","paragraphs":["Sebuah fragrance sering dikaitkan dengan nama perfumer. Namun dalam praktik profesional, produk akhir dapat melibatkan beberapa peran."],"items":[{"title":"Perfumer","body":"Mengembangkan formula dan arah olfaktori, memilih material, menyusun hubungan antar-material, mengevaluasi hasil, dan membuat modifikasi."},{"title":"Evaluator atau Creative Fragrance Developer","body":"Membantu menerjemahkan brief, menilai modifikasi, dan memastikan hasil tetap sesuai dengan arah produk atau brand."},{"title":"Laboratory Team","body":"Menimbang formula dengan akurat, menyiapkan modifikasi, dan memastikan sampel dibuat secara konsisten."},{"title":"Regulatory and Safety Team","body":"Memeriksa batas material, dokumentasi, kategori aplikasi, persyaratan keselamatan, dan kewajiban regulasi."},{"title":"Brand atau Creative Director","body":"Menentukan dunia, audiens, positioning, cerita, karakter, dan arah akhir produk."},{"title":"Manufacturer","body":"Mengubah fragrance concentrate menjadi produk akhir melalui produksi, pengisian, kontrol konsistensi, kontrol kualitas, dan packaging."}],"closing":"Pada brand artisan seperti Indische Artisan, beberapa fungsi tersebut dapat dilakukan oleh orang yang sama atau tim kecil. Namun fungsinya tetap ada: penciptaan, evaluasi, penimbangan, produksi, pemeriksaan, dan pengambilan keputusan."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 13;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000013'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'perfumer_note', 13, 'draft', $academy_json${"emphasis":"high"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'perfumer_note', status = 'draft', settings = $academy_json${"emphasis":"high"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Smell the Decision, Not Only the Ingredient","body":"Beginners often feel that smelling perfume means guessing ingredients. Material recognition is useful, but it is not the only way to understand a fragrance. Ask what has been brightened, softened, made distant, kept close to the skin, designed to last, or left intentionally rough. When you begin to smell decisions, perfume no longer feels like a note-list puzzle. It begins to reveal itself as something constructed."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Cium Keputusannya, Bukan Hanya Bahannya","body":"Pemula sering merasa bahwa mencium parfum berarti menebak bahan. Kemampuan mengenali material memang berguna, tetapi itu bukan satu-satunya cara memahami fragrance. Tanyakan apa yang dibuat lebih terang, lebih lembut, lebih jauh, lebih dekat dengan kulit, lebih bertahan, atau sengaja dibiarkan kasar. Ketika mulai mencium keputusan, parfum tidak lagi terasa seperti teka-teki note list. Ia mulai terlihat sebagai sesuatu yang dibangun."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 14;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000014'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'exercise', 14, 'draft', $academy_json${"estimatedMinutes":15}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'exercise', status = 'draft', settings = $academy_json${"estimatedMinutes":15}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Reading a Perfume Without Reading Its Notes","purpose":"Observe a fragrance as the result of creative decisions before reading the brand’s official description.","materials":["One perfume you already own","A blotter or unscented piece of paper","A notebook","A timer"],"steps":[{"title":"Hide the Note List","body":"Do not read the product description, reviews, or other people’s impressions."},{"title":"Smell the Opening","body":"Spray once onto the blotter. Record three first impressions, then describe brightness, temperature, weight, space, familiarity, and texture. Do not identify notes."},{"title":"Imagine the Intention","body":"Ask when it feels appropriate to wear, what kind of space belongs to it, who might wear it, and whether it seems designed to comfort, refresh, attract attention, create distance, or cause slight unease."},{"title":"Wait","body":"Smell again after 15–20 minutes. Record what softened, became clearer, diminished, changed in texture, or changed in spatial feeling."},{"title":"Read the Brand Description","body":"Compare the official note list with your observations. Record what matched, what you did not perceive, what you perceived but was not listed, and whether the description changed your perception."}],"closing":"A note list is a communication tool. It is not a complete formula and should not always be read as a literal list of every material used."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Membaca Parfum Tanpa Membaca Notes-nya","purpose":"Mengamati fragrance sebagai hasil keputusan kreatif sebelum membaca deskripsi resmi brand.","materials":["Satu parfum yang sudah dimiliki","Blotter atau kertas yang tidak beraroma","Buku catatan","Timer"],"steps":[{"title":"Sembunyikan Note List","body":"Jangan membaca deskripsi produk, review, atau kesan orang lain."},{"title":"Cium Opening","body":"Semprot satu kali pada blotter. Catat tiga kesan pertama, lalu gambarkan brightness, temperature, weight, space, familiarity, dan texture. Jangan menebak notes."},{"title":"Bayangkan Maksudnya","body":"Tanyakan kapan parfum terasa cocok dipakai, ruang seperti apa yang sesuai, siapa yang mungkin memakainya, dan apakah parfum ingin menenangkan, menyegarkan, menarik perhatian, menjaga jarak, atau menimbulkan sedikit rasa tidak nyaman."},{"title":"Tunggu","body":"Cium kembali setelah 15–20 menit. Catat apa yang melembut, menjadi lebih jelas, berkurang, berubah tekstur, atau berubah dalam kesan ruang."},{"title":"Baca Deskripsi Brand","body":"Bandingkan note list resmi dengan pengamatanmu. Catat apa yang sesuai, apa yang tidak kamu rasakan, apa yang kamu rasakan tetapi tidak disebutkan, dan apakah deskripsi brand mengubah persepsimu."}],"closing":"Note list adalah alat komunikasi. Ia bukan formula lengkap dan tidak selalu dapat dibaca sebagai daftar literal seluruh material yang digunakan."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 15;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000015'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'journal_prompt', 15, 'draft', $academy_json${"persistence":"none","displayMode":"reflection"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'journal_prompt', status = 'draft', settings = $academy_json${"persistence":"none","displayMode":"reflection"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Reflection","prompts":["Before this lesson, what did you imagine a perfumer actually did?","Did the perfume you observed seem to have one clear intention?","Which decision was most noticeable: texture, strength, contrast, space, or development?","Did reading the note list change your perception?","What is one thing you want to observe the next time you smell a perfume?"],"note":"Answer in a notebook or personal notes application. Saving inside The Academy will be introduced in a later phase."}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Refleksi","prompts":["Sebelum lesson ini, apa yang kamu bayangkan dilakukan seorang perfumer?","Apakah parfum yang kamu amati terasa memiliki satu maksud yang jelas?","Keputusan apa yang paling terasa: texture, strength, contrast, space, atau development?","Apakah membaca note list mengubah persepsimu?","Apa satu hal yang ingin kamu perhatikan saat mencium parfum berikutnya?"],"note":"Jawab di buku catatan atau aplikasi catatan pribadi. Penyimpanan langsung di The Academy akan diperkenalkan pada fase berikutnya."}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 16;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000016'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'summary', 16, 'draft', $academy_json${"style":"numbered"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'summary', status = 'draft', settings = $academy_json${"style":"numbered"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"title":"Five Ideas to Remember","items":[{"title":"Perfumery begins with intention","body":"An idea must be translated into an olfactory direction, materials, structure, and development."},{"title":"Materials have functions","body":"Materials are chosen not only for their smell, but for what they do inside a formula."},{"title":"A formula is a relationship","body":"One material can change how another is perceived. Quantity does not automatically determine complexity."},{"title":"Evaluation is part of creation","body":"A perfumer smells, waits, compares, records, and modifies."},{"title":"A perfume must work as a real product","body":"Concentration, medium, performance, stability, safety, and intended use all matter."}]}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"title":"Lima Hal yang Perlu Diingat","items":[{"title":"Perfumery dimulai dari sebuah maksud","body":"Sebuah ide harus diterjemahkan menjadi arah olfaktori, material, struktur, dan perkembangan."},{"title":"Material memiliki fungsi","body":"Material dipilih bukan hanya karena aromanya, tetapi karena apa yang dilakukannya di dalam formula."},{"title":"Formula adalah hubungan","body":"Satu material dapat mengubah cara material lain dirasakan. Jumlah tidak otomatis menentukan kompleksitas."},{"title":"Evaluasi adalah bagian dari penciptaan","body":"Perfumer mencium, menunggu, membandingkan, mencatat, dan memodifikasi."},{"title":"Parfum harus bekerja sebagai produk nyata","body":"Konsentrasi, medium, performa, stabilitas, keselamatan, dan penggunaan akhir semuanya penting."}]}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();

    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = 17;
    if target_block_id is null then
      target_block_id := 'a4100000-0000-4000-8000-000000000017'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, 'rich_text', 17, 'draft', $academy_json${"variant":"transition"}$academy_json$::jsonb);
    else
      update public.academy_lesson_blocks set block_type = 'rich_text', status = 'draft', settings = $academy_json${"variant":"transition"}$academy_json$::jsonb, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', $academy_json${"heading":"Continue Observing","paragraphs":["Before moving to Lesson 2, choose another perfume. Do not look at its notes.","Write down only five qualities: temperature, texture, weight, space, and movement.","Keep this observation. In the next lesson, we will examine why two people can smell the same formula yet experience and describe it differently."],"nextLesson":{"title":"How We Experience Smell","question":"If the formula remains the same, why can the experience of smelling it differ from one person to another?"}}$academy_json$::jsonb),
      (target_block_id, 'id', $academy_json${"heading":"Lanjutkan Pengamatan","paragraphs":["Sebelum melanjutkan ke Lesson 2, pilih satu parfum lain. Jangan melihat notes-nya.","Tuliskan hanya lima kualitas: temperature, texture, weight, space, dan movement.","Simpan pengamatan ini. Pada lesson berikutnya, kita akan melihat mengapa dua orang dapat mencium formula yang sama, tetapi mengalami dan menggambarkannya secara berbeda."],"nextLesson":{"title":"How We Experience Smell","question":"Jika formulanya sama, mengapa pengalaman mencium dapat berbeda dari satu orang ke orang lain?"}}$academy_json$::jsonb)
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();
end;
$academy_import$;

commit;
