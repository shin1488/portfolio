import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GuestBookForm.module.css';
import type { TablesInsert } from '../../types/supabase';
import { createGuestbook } from '../../api/getGuestbook';
import BizCardItem from '../../components/BizCardItem/BizCardItem';
import BizCardBackItem from '../../components/BizCardBackItem/BizCardBackItem';

const GuestBookForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<TablesInsert<'guestbook'>>({
        visitor_name: '',
        profile_img: null,
        main_stack: '',
        experience: 0,
        mbti: '',
        phone: '',
        github_url: '',
        linked_in_url: '',
        blog_url: '',
        comment: '',
        is_hidden: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'experience' ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        const { visitor_name, profile_img, main_stack, experience, mbti, phone } = formData;
        if (!visitor_name || !profile_img || !main_stack || !experience || !mbti || !phone) {
            alert('모든 필수 항목(*)을 입력해주세요.');
            return;
        }
        try {
            await createGuestbook(formData);
            alert('방명록이 등록되었습니다!');
            navigate('/guestbook');
        } catch (err) {
            console.error(err);
            alert('등록 실패');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>방명록 작성</h1>
            <form className={styles.form_section}>
                <div className={styles.split_wrapper}>
                    {/* 왼쪽: 미리보기 */}
                    <div className={styles.left_side}>
                        <div className={`${styles.item_wrapper} ${step === 1 ? styles.active : styles.exit}`}>
                            <BizCardItem data={formData as any} />
                        </div>
                        <div className={`${styles.item_wrapper} ${step === 2 ? styles.active : styles.enter}`}>
                            <BizCardBackItem data={formData as any} />
                        </div>
                    </div>

                    {/* 오른쪽: 입력 폼 */}
                    <div className={styles.right_side}>
                        {/* 앞면 */}
                        <div className={`${styles.item_wrapper} ${step === 1 ? styles.active : styles.exit}`}>
                            <div className={styles.form_page}>
                                <div className={styles.input_group}>
                                    <label>이름 *</label>
                                    <input name='visitor_name' value={formData.visitor_name} onChange={handleChange} required />
                                </div>
                                <div className={styles.input_group}>
                                    <label>프로필 사진 URL *</label>
                                    <input name='profile_img' onChange={handleChange} placeholder='https://...' required />
                                </div>
                                <div className={styles.input_group}>
                                    <label>직무 *</label>
                                    <input name='main_stack' onChange={handleChange} placeholder='Front-end' required />
                                </div>
                                <div className={styles.input_group}>
                                    <label>연차 *</label>
                                    <input name='experience' type='number' onChange={handleChange} required />
                                </div>
                                <div className={styles.input_group}>
                                    <label>MBTI *</label>
                                    <input name='mbti' onChange={handleChange} maxLength={4} required />
                                </div>
                                <button type='button' className={styles.next_btn} onClick={() => setStep(2)}>다음 →</button>
                            </div>
                        </div>

                        {/* 뒷면 */}
                        <div className={`${styles.item_wrapper} ${step === 2 ? styles.active : styles.enter}`}>
                            <div className={styles.form_page}>
                                <div className={styles.input_group}>
                                    <label>휴대전화 *</label>
                                    <input name='phone' type='number' onChange={handleChange} maxLength={11} required />
                                </div>
                                <div className={styles.input_group}>
                                    <label>Github URL</label>
                                    <input name='github_url' onChange={handleChange} />
                                </div>
                                <div className={styles.input_group}>
                                    <label>LinkedIn URL</label>
                                    <input name='linked_in_url' onChange={handleChange} />
                                </div>
                                <div className={styles.input_group}>
                                    <label>Blog URL</label>
                                    <input name='blog_url' onChange={handleChange} />
                                </div>
                                <div className={styles.input_group}>
                                    <label>한 줄 소개</label>
                                    <input name='comment' onChange={handleChange} />
                                </div>
                                <div className={styles.btn_row}>
                                    <button type='button' className={styles.back_btn} onClick={() => setStep(1)}>돌아가기</button>
                                    <button type='submit' className={styles.submit_btn} onClick={handleSubmit}>방명록 작성</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GuestBookForm;