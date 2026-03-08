const fs = require('fs');
const path = require('path');

// Complete curated Adkar dataset from Hisn al-Muslim
// Run once: node scripts/fetch-adkar.js
const adkarData = {
    sabah: [
        {
            id: 1,
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
            transliteration: "Asbahna wa asbahal-mulku lillahi wal-hamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhal-yawmi wa khayra ma ba'dahu, wa a'udhu bika min sharri ma fi hadhal-yawmi wa sharri ma ba'dahu. Rabbi a'udhu bika minal-kasali wa su'il-kibar, Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr.",
            translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and senility. My Lord, I seek refuge in You from torment in the Fire and torment in the grave.',
            reference: 'Muslim 4/2088',
            repeat: 1,
            benefit: 'A comprehensive morning supplication for protection and goodness'
        },
        {
            id: 2,
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
            transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur",
            translation: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die, and unto You is our resurrection.',
            reference: 'At-Tirmidhi 5/466',
            repeat: 1,
            benefit: 'Morning remembrance of life, death and resurrection'
        },
        {
            id: 3,
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
            transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya, wa abu'u bi-dhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta.",
            translation: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil, which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
            reference: 'Al-Bukhari 7/150',
            repeat: 1,
            benefit: 'Sayyid al-Istigfar (The Master of Forgiveness). Whoever says this with conviction in the morning and dies before evening will be among the people of Paradise.'
        },
        {
            id: 4,
            arabic: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
            transliteration: "Allahumma inni asbahtu ushhiduka wa ushhidu hamalata 'arshika, wa mala'ikataka wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluka.",
            translation: "O Allah, I have reached the morning and call upon You, the bearers of Your Throne, Your angels and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad is Your Servant and Messenger.",
            reference: 'Abu Dawud 4/317',
            repeat: 4,
            benefit: 'Whoever says this 4 times in the morning, Allah will protect him from Hellfire'
        },
        {
            id: 5,
            arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
            transliteration: "Allahumma ma asbaha bi min ni'matin aw bi-ahadim-min khalqika fa-minka wahdaka la sharika laka, falakal-hamdu walakash-shukr.",
            translation: 'O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.',
            reference: 'Abu Dawud 4/318',
            repeat: 1,
            benefit: 'Whoever says this in the morning has offered his day\'s thanks'
        },
        {
            id: 6,
            arabic: 'حَسْبِيَ اللهُ لَا إِلَـهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
            transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
            translation: 'Allah is sufficient for me. There is no deity but Him. In Him I have put my trust and He is the Lord of the formidable Throne.',
            reference: 'Abu Dawud 4/321',
            repeat: 7,
            benefit: 'Allah will grant whoever says this seven times in the morning or evening whatever he desires from this world or the next.'
        },
        {
            id: 7,
            arabic: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
            transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
            translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is the All-Hearing, the All-Knowing.',
            reference: 'Abu Dawud 4/323',
            repeat: 3,
            benefit: 'Whoever says this three times in the morning will not be afflicted by any calamity until evening, and whoever says it in the evening will not be afflicted until morning.'
        },
        {
            id: 8,
            arabic: 'اللَّهُمَّ عافِنِي فِي بَدَنِي، اللَّهُمَّ عافِنِي فِي سَمْعِي، اللَّهُمَّ عافِنِي فِي بَصَرِي، لا إلهَ إلا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذابِ القَبْرِ، لا إلهَ إلا أَنْتَ',
            transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari. La ilaha illa Anta. Allahumma inni a'udhu bika minal-kufri wal-faqri, wa a'udhu bika min 'adhabil-qabri, la ilaha illa Anta.",
            translation: 'O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.',
            reference: 'Abu Dawud 4/324',
            repeat: 3,
            benefit: 'Supplication for health and protection from disbelief, poverty, and the punishment of the grave'
        },
        {
            id: 9,
            arabic: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
            transliteration: "Raditu billahi rabba, wa bil-islami dina, wa bi-Muhammadin ﷺ nabiyya",
            translation: 'I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet.',
            reference: 'Abu Dawud 4/318',
            repeat: 3,
            benefit: 'Allah has promised that whoever says this three times every morning or evening will be pleased on the Day of Resurrection.'
        },
        {
            id: 10,
            arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
            transliteration: "Ya Hayyu ya Qayyumu birahmatika astaghithu aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'ayn.",
            translation: 'O Ever-Living, O Sustainer of all, by Your mercy I seek help; rectify all my affairs and do not leave me to myself, even for the blink of an eye.',
            reference: 'Al-Hakim 1/545',
            repeat: 1,
            benefit: 'Entrusting all affairs to Allah and seeking His rectification'
        },
        {
            id: 11,
            arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
            transliteration: "Asbahna 'ala fitratil-Islami wa 'ala kalimatil-ikhlas, wa 'ala dini Nabiyyina Muhammadin sallallahu 'alayhi wa sallam, wa 'ala millati abina Ibrahima hanifan Musliman wa ma kana minal-mushrikin.",
            translation: 'We have reached the morning upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace and blessings of Allah be upon him), and the faith of our father Ibrahim. He was upright (in belief) and a Muslim and was not of those who worship others besides Allah.',
            reference: 'Ahmad 3/406',
            repeat: 1,
            benefit: 'Affirming faith and adhering to the path of Ibrahim (AS)'
        },
        {
            id: 12,
            arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
            transliteration: "Subhanallahi wa bihamdih",
            translation: 'Glory is to Allah and praise is to Him.',
            reference: 'Muslim 4/2071',
            repeat: 100,
            benefit: 'Whoever says this one hundred times in the morning and evening, none will come on the Day of Resurrection with anything better except one who has said the same or more.'
        },
        {
            id: 13,
            arabic: 'لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir.",
            translation: 'None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
            reference: 'Muslim 4/2071',
            repeat: 10,
            benefit: 'Allah will write for him ten good deeds, erase ten evil deeds, and raise him ten degrees in status.'
        },
        {
            id: 14,
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْراتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
            transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahumma-stur 'awrati wa amin raw'ati. Allahumma-hfazni min bayni yadayya wa min khalfi wa 'an yamini wa 'an shimali wa min fawqi wa a'udhu bi'adhamatika an ughtala min tahti.",
            translation: 'O Allah, I ask You for forgiveness and well-being in this world and the next. O Allah, I ask You for forgiveness and well-being in my religion and my worldly affairs and my family and my property. O Allah, conceal my faults, calm my fears, and protect me from before me and behind me, from my right and my left, and from above me, and I seek refuge in Your greatness from being swallowed up from beneath me.',
            reference: 'Abu Dawud 5074',
            repeat: 1,
            benefit: 'A comprehensive prayer for protection of life, religion, family and wealth.'
        }
    ],
    masa: [
        {
            id: 1,
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
            transliteration: "Amsayna wa amsal-mulku lillahi wal-hamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhihil-laylati wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylati wa sharri ma ba'daha. Rabbi a'udhu bika minal-kasali wa su'il-kibar, Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr.",
            translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it, and I seek refuge in You from the evil of this night and the evil of what follows it. My Lord, I seek refuge in You from laziness and senility. My Lord, I seek refuge in You from torment in the Fire and torment in the grave.',
            reference: 'Muslim 4/2088',
            repeat: 1,
            benefit: 'A comprehensive evening supplication for protection and goodness'
        },
        {
            id: 2,
            arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
            transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal-masir",
            translation: 'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die, and unto You is our return.',
            reference: 'At-Tirmidhi 5/466',
            repeat: 1,
            benefit: 'Evening remembrance of life, death and return to Allah'
        },
        {
            id: 3,
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
            transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya, wa abu'u bi-dhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta.",
            translation: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil, which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
            reference: 'Al-Bukhari 7/150',
            repeat: 1,
            benefit: 'Sayyid al-Istigfar (The Master of Forgiveness). Whoever says this with conviction in the evening and dies before morning will be among the people of Paradise.'
        },
        {
            id: 4,
            arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
            transliteration: "Allahumma inni amsaytu ushhiduka wa ushhidu hamalata 'arshika, wa mala'ikataka wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluka.",
            translation: "O Allah, I have reached the evening and call upon You, the bearers of Your Throne, Your angels and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad is Your Servant and Messenger.",
            reference: 'Abu Dawud 4/317',
            repeat: 4,
            benefit: 'Whoever says this 4 times in the evening, Allah will protect him from Hellfire'
        },
        {
            id: 5,
            arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
            transliteration: "Allahumma ma amsa bi min ni'matin aw bi-ahadim-min khalqika fa-minka wahdaka la sharika laka, falakal-hamdu walakash-shukr.",
            translation: 'O Allah, what blessing I or any of Your creation have reached the evening upon, is from You alone, without partner, so for You is all praise and unto You all thanks.',
            reference: 'Abu Dawud 4/318',
            repeat: 1,
            benefit: 'Whoever says this in the evening has offered his night\'s thanks'
        },
        {
            id: 6,
            arabic: 'حَسْبِيَ اللهُ لَا إِلَـهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
            transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
            translation: 'Allah is sufficient for me. There is no deity but Him. In Him I have put my trust and He is the Lord of the formidable Throne.',
            reference: 'Abu Dawud 4/321',
            repeat: 7,
            benefit: 'Allah will grant whoever says this seven times in the morning or evening whatever he desires from this world or the next.'
        },
        {
            id: 7,
            arabic: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
            transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
            translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is the All-Hearing, the All-Knowing.',
            reference: 'Abu Dawud 4/323',
            repeat: 3,
            benefit: 'Protection from harm in the night'
        },
        {
            id: 8,
            arabic: 'اللَّهُمَّ عافِنِي فِي بَدَنِي، اللَّهُمَّ عافِنِي فِي سَمْعِي، اللَّهُمَّ عافِنِي فِي بَصَرِي، لا إلهَ إلا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذابِ القَبْرِ، لا إلهَ إلا أَنْتَ',
            transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari. La ilaha illa Anta. Allahumma inni a'udhu bika minal-kufri wal-faqri, wa a'udhu bika min 'adhabil-qabri, la ilaha illa Anta.",
            translation: 'O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.',
            reference: 'Abu Dawud 4/324',
            repeat: 3,
            benefit: 'Supplication for health and protection'
        },
        {
            id: 9,
            arabic: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
            transliteration: "Raditu billahi rabba, wa bil-islami dina, wa bi-Muhammadin ﷺ nabiyya",
            translation: 'I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet.',
            reference: 'Abu Dawud 4/318',
            repeat: 3,
            benefit: 'Allah will be pleased with him on the Day of Resurrection'
        },
        {
            id: 10,
            arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
            transliteration: "Ya Hayyu ya Qayyumu birahmatika astaghithu aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'ayn.",
            translation: 'O Ever-Living, O Sustainer of all, by Your mercy I seek help; rectify all my affairs and do not leave me to myself, even for the blink of an eye.',
            reference: 'Al-Hakim 1/545',
            repeat: 1,
            benefit: 'Entrusting all affairs to Allah'
        },
        {
            id: 11,
            arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
            transliteration: "Amsayna 'ala fitratil-Islami wa 'ala kalimatil-ikhlas, wa 'ala dini Nabiyyina Muhammadin sallallahu 'alayhi wa sallam, wa 'ala millati abina Ibrahima hanifan Musliman wa ma kana minal-mushrikin.",
            translation: 'We have reached the evening upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace and blessings of Allah be upon him), and the faith of our father Ibrahim. He was upright (in belief) and a Muslim and was not of those who worship others besides Allah.',
            reference: 'Ahmad 3/406',
            repeat: 1,
            benefit: 'Affirming faith every evening'
        },
        {
            id: 12,
            arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
            transliteration: "Subhanallahi wa bihamdih",
            translation: 'Glory is to Allah and praise is to Him.',
            reference: 'Muslim 4/2071',
            repeat: 100,
            benefit: 'Great reward on the Day of Resurrection'
        },
        {
            id: 13,
            arabic: 'لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir.",
            translation: 'None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
            reference: 'Muslim 4/2071',
            repeat: 10,
            benefit: 'Protection from Shaytan and great rewards'
        },
        {
            id: 14,
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْراتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
            transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahumma-stur 'awrati wa amin raw'ati. Allahumma-hfazni min bayni yadayya wa min khalfi wa 'an yamini wa 'an shimali wa min fawqi wa a'udhu bi'adhamatika an ughtala min tahti.",
            translation: 'O Allah, I ask You for forgiveness and well-being in this world and the next. O Allah, I ask You for forgiveness and well-being in my religion and my worldly affairs and my family and my property. O Allah, conceal my faults, calm my fears, and protect me from before me and behind me, from my right and my left, and from above me, and I seek refuge in Your greatness from being swallowed up from beneath me.',
            reference: 'Abu Dawud 5074',
            repeat: 1,
            benefit: 'Comprehensive protection for life, religion, family and wealth'
        },
        {
            id: 15,
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
            translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
            reference: 'Muslim 4/2080',
            repeat: 3,
            benefit: 'Protection during the night'
        }
    ],
    after_prayer: [
        {
            id: 1,
            arabic: 'أَسْتَغْفِرُ الله (3)',
            transliteration: "Astaghfirullah (3)",
            translation: 'I seek forgiveness from Allah (3 times).',
            reference: 'Muslim 1/414',
            repeat: 1,
            benefit: 'Said after every obligatory prayer'
        },
        {
            id: 2,
            arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
            transliteration: "Allahumma antas-salam, wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
            translation: 'O Allah, You are As-Salam and from You is all peace, blessed are You, O Possessor of majesty and honour.',
            reference: 'Muslim 1/414',
            repeat: 1,
            benefit: 'Recited immediately after the three Istighfars'
        },
        {
            id: 3,
            arabic: 'لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
            transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadir. Allahumma la mani'a lima a'tayt, wa la mu'tiya lima mana't, wa la yanfa'u dhal-jaddi minkal-jadd",
            translation: 'None has the right to be worshipped except Allah, alone without any partner. To Him belongs all sovereignty and praise. O Allah! None can prevent what You have willed to bestow and none can bestow what You have willed to prevent, and no wealth or majesty can benefit anyone, as from You is all wealth and majesty.',
            reference: 'Al-Bukhari 1/255, Muslim 1/414',
            repeat: 1,
            benefit: 'A powerful affirmation of Allah\'s absolute power'
        },
        {
            id: 4,
            arabic: 'سُبْحَانَ اللهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللهُ أَكْبَرُ (33)',
            transliteration: "Subhanallah (33), Alhamdulillah (33), Allahu Akbar (33)",
            translation: 'Glory is to Allah, All praise is for Allah, Allah is the Greatest.',
            reference: 'Muslim 1/418',
            repeat: 1,
            benefit: 'Following the 33 recitations, conclude with: "La ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wahuwa \'ala kulli shay\'in qadir" to have all sins forgiven even if they are as numerous as the foam of the sea.'
        },
        {
            id: 5,
            arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
            transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bi-shay'im-min 'ilmihi illa bi-ma sha'. Wasi'a kursiyyuhus-samawati wal-ard. Wa la ya'uduhu hifdhuhuma wa Huwal-'Aliyyul-'Adhim.",
            translation: 'Allah! There is no deity but He, the Living, the Self-Subsisting, the Eternal. No slumber can seize Him nor sleep. All things in the heavens and on earth are His. Who is there that can intercede in His presence except as He permitteth? He knoweth what (appeareth to His creatures as) before or after or behind them. Nor shall they compass aught of His knowledge except as He willeth. His Throne doth extend over the heavens and the earth, and He feeleth no fatigue in guarding and preserving them for He is the Most High, the Supreme.',
            reference: 'An-Nasa\'i (Amalul-Yawm wal-Laylah 100), Al-Baqarah 255',
            repeat: 1,
            benefit: 'Whoever recites this after every prayer, nothing prevents him from entering Paradise except death'
        }
    ],
    prayer: [
        {
            id: 1,
            arabic: 'بِسْمِ اللهِ',
            transliteration: "Bismillah",
            translation: 'In the name of Allah.',
            reference: 'Abu Dawud 3/347',
            repeat: 1,
            benefit: 'Said before starting Wudu'
        },
        {
            id: 2,
            arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
            transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu wa ash-hadu anna Muhammadan 'abduhu wa Rasuluhu",
            translation: 'I bear witness that none has the right to be worshipped but Allah alone, Who has no partner; and I bear witness that Muhammad is His slave and His Messenger.',
            reference: 'Muslim 1/209',
            repeat: 1,
            benefit: 'Said after completing Wudu'
        },
        {
            id: 3,
            arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            transliteration: "Allahummaf-tah li abwaba rahmatik",
            translation: 'O Allah, open the gates of Your mercy for me.',
            reference: 'Muslim 1/495',
            repeat: 1,
            benefit: 'Said when entering the Mosque'
        },
        {
            id: 4,
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
            transliteration: "Allahumma inni as'aluka min fadlik",
            translation: 'O Allah, I ask You from Your favor.',
            reference: 'Muslim 1/495',
            repeat: 1,
            benefit: 'Said when leaving the Mosque'
        },
        {
            id: 5,
            arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَواتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
            transliteration: "At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu 'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh, as-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa Rasuluh.",
            translation: 'All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that none has the right to be worshipped but Allah, and I bear witness that Muhammad is His slave and His Messenger.',
            reference: 'Al-Bukhari 1/13, Muslim 1/301',
            repeat: 1,
            benefit: 'Recited during the Tashahhud in prayer'
        },
        {
            id: 6,
            arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
            transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum-Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum-Majid.",
            translation: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, just as You sent prayers upon Ibrahim and upon the family of Ibrahim; indeed, You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad, just as You blessed Ibrahim and the family of Ibrahim; indeed, You are Praiseworthy and Glorious.',
            reference: 'Al-Bukhari 4/118',
            repeat: 1,
            benefit: 'The Salawat Ibrahimiyah recited in the final Tashahhud'
        }
    ],
    daily: [
        {
            id: 1,
            arabic: 'بِاسْمِ اللهِ',
            transliteration: "Bismillah",
            translation: 'In the name of Allah.',
            reference: 'Abu Dawud 3/347',
            repeat: 1,
            benefit: 'Said before eating'
        },
        {
            id: 2,
            arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
            transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
            translation: 'All praise is for Allah Who fed me this and provided it for me, without any strength or power on my part.',
            reference: 'Abu Dawud 4/318',
            repeat: 1,
            benefit: 'Said after eating'
        },
        {
            id: 3,
            arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ',
            transliteration: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
            translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
            reference: 'Abu Dawud 4/325',
            repeat: 1,
            benefit: 'Said when leaving home'
        },
        {
            id: 4,
            arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
            transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala rabbina tawakkalna",
            translation: 'In the name of Allah we enter, and in the name of Allah we leave, and upon our Lord we place our trust.',
            reference: 'Abu Dawud 4/325',
            repeat: 1,
            benefit: 'Said when entering the home'
        },
        {
            id: 5,
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الخُبُثِ وَالْخَبَائِثِ',
            transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
            translation: 'O Allah, I seek Your protection from evil male and female Jinn.',
            reference: 'Al-Bukhari 1/45',
            repeat: 1,
            benefit: 'Said when entering the toilet'
        },
        {
            id: 6,
            arabic: 'غُفْرَانَكَ',
            transliteration: "Ghufranaka",
            translation: 'I ask You for forgiveness.',
            reference: 'Abu Dawud 1/5',
            repeat: 1,
            benefit: 'Said when leaving the toilet'
        },
        {
            id: 7,
            arabic: 'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي',
            transliteration: "Allahumma anta hassanta khalqi fahassin khuluqi",
            translation: 'O Allah, just as You have made my external features beautiful, make my character beautiful as well.',
            reference: 'Ahmad 1/403',
            repeat: 1,
            benefit: 'Said when looking in the mirror'
        },
        {
            id: 8,
            arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَـهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
            transliteration: "Subhanaka Allahumma wa bihamdika, ashhadu an la ilaha illa Anta, astaghfiruka wa atubu ilayk",
            translation: 'Glory is to You, O Allah, and praise; I bear witness that there is none worthy of worship but You. I seek Your forgiveness and turn to You in repentance.',
            reference: 'Abu Dawud, At-Tirmidhi',
            repeat: 1,
            benefit: 'Kaffaratul Majlis (Atonement for a Gathering)'
        }
    ],
    funeral: [
        {
            id: 1,
            arabic: 'السَّلاَمُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
            transliteration: "Assalamu 'alaykum 'ahlad-diyari minal-mu'minina wal-muslimin, wa inna in sha'allahu bikum lahiqun, nas'alullaha lana wa lakumul-'afiyah",
            translation: 'Peace be upon you, O people of the graves, from among the believers and the Muslims. Indeed we shall, if Allah wills, be joining you. I ask Allah for well-being for us and for you.',
            reference: 'Muslim 2/671',
            repeat: 1,
            benefit: 'Said when visiting the graveyard (Qabar Ziyarat)'
        }
    ],
    nature: [
        {
            id: 1,
            arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
            transliteration: "Allahumma sayyiban nafi'an",
            translation: 'O Allah, make it a beneficial rain.',
            reference: 'Al-Bukhari 2/608',
            repeat: 1,
            benefit: 'Said when it rains'
        },
        {
            id: 2,
            arabic: 'مُطِرْنَا بِفَضْلِ اللهِ وَرَحْمَتِهِ',
            transliteration: "Mutirna bi fadlillahi wa rahmatihi",
            translation: 'We have been given rain by the grace and mercy of Allah.',
            reference: 'Al-Bukhari 1/205, Muslim 1/83',
            repeat: 1,
            benefit: 'Said after it has rained'
        },
        {
            id: 3,
            arabic: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
            transliteration: "Subhanalladhi yusabbihur-ra'du bihamdihi wal-mala'ikatu min khifatih",
            translation: 'Glory is to Him Whom the thunder exalts with praise and the angels out of fear of Him.',
            reference: 'Muwatta 2/992',
            repeat: 1,
            benefit: 'Said upon hearing thunder'
        },
        {
            id: 4,
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا',
            transliteration: "Allahumma inni as'aluka khayraha, wa a'udhu bika min sharriha",
            translation: 'O Allah, I ask You for its good and seek refuge in You from its evil.',
            reference: 'Abu Dawud 4/326',
            repeat: 1,
            benefit: 'Said when the wind blows strongly'
        }
    ],
    sleep: [
        {
            id: 1,
            arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
            transliteration: "Bismika Allahumma amutu wa ahya",
            translation: 'In Your name, O Allah, I die and I live.',
            reference: 'Al-Bukhari 11/113, Muslim 4/2083',
            repeat: 1,
            benefit: 'Said before sleeping'
        },
        {
            id: 2,
            arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
            transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
            translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your slaves.',
            reference: 'Abu Dawud 4/311',
            repeat: 3,
            benefit: 'Said when lying down to sleep'
        },
        {
            id: 4,
            arabic: 'اللَّهُمَّ بِاسْمِكَ أَحْيَا وَأَمُوتُ',
            transliteration: "Allahumma bismika ahya wa amut",
            translation: 'O Allah, in Your name I live and I die.',
            reference: 'Muslim 4/2083',
            repeat: 1,
            benefit: 'Said when waking up'
        },
        {
            id: 5,
            arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
            translation: 'All praise is for Allah Who gave us life after having taken it from us and unto Him is the resurrection.',
            reference: 'Al-Bukhari 11/113, Muslim 4/2083',
            repeat: 1,
            benefit: 'Said when waking up from sleep'
        }
    ],
    sick: [
        {
            id: 1,
            arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا',
            transliteration: "Allahumma Rabban-nas, adhhibil-ba's, ishfi Antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama.",
            translation: 'O Allah, Lord of mankind, remove the hardship and grant cure. You are the Healer. There is no cure but Your cure, a cure that leaves no disease behind.',
            reference: 'Al-Bukhari 7/158, Muslim 4/1721',
            repeat: 1,
            benefit: 'Supplication for the sick'
        },
        {
            id: 2,
            arabic: 'لاَ بَأْسَ طَهُورٌ إِنْ شَاءَ اللهُ',
            transliteration: "La ba'sa tahurun in sha' Allah",
            translation: 'No need to worry, it is a purification, if Allah wills.',
            reference: 'Al-Bukhari 10/118',
            repeat: 1,
            benefit: 'Said when visiting the sick'
        }
    ],
    travel: [
        {
            id: 1,
            arabic: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            transliteration: "Allahu Akbar, Allahu Akbar, Allahu Akbar. Subhanalladhi sakh-khara lana hadha wa ma kunna lahu muqrinina wa inna ila Rabbina lamun-qalibun.",
            translation: 'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning.',
            reference: 'Muslim 2/998',
            repeat: 1,
            benefit: 'Supplication for starting travel'
        },
        {
            id: 2,
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ',
            transliteration: "Allahumma inni a'udhu bika min wa'thais-safar, wa kabatil-mandhar, wa su'il-munqalabi fil-mali wal-ahl.",
            translation: 'O Allah, I seek refuge in You from the hardships of travel, any gloomy outlook in what I see, and any evil return to my property or my family.',
            reference: 'Muslim 2/998',
            repeat: 1,
            benefit: 'Said during travel for protection'
        }
    ]
};


function run() {
    const dir = require('path').join(__dirname, '..', 'assets', 'data');
    if (!require('fs').existsSync(dir)) require('fs').mkdirSync(dir, { recursive: true });
    const outPath = require('path').join(dir, 'adkar.json');
    require('fs').writeFileSync(outPath, JSON.stringify(adkarData, null, 2));
    const total = Object.values(adkarData).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`✅ Adkar data written to ${outPath}`);
    console.log(`   Categories: ${Object.keys(adkarData).join(', ')}`);
    console.log(`   Total adkar: ${total}`);
}

run();
